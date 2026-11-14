"""Shared SPHEREx data access: image search, AWS cutout reading, visit grouping.

Extracted from proof/make_frames.py so every module reads data the same way.
"""
import csv
import io
import urllib.parse
import urllib.request

import numpy as np
from astropy.io import fits
from astropy.time import Time
from astropy.wcs import WCS

TAP = "https://irsa.ipac.caltech.edu/TAP/sync"
S3 = "https://nasa-irsa-spherex.s3.amazonaws.com/"
OUT_SCALE = 3.0        # arcsec per output pixel (native is ~6.15)
NATIVE_SCALE = 6.15
VISIT_GAP_DAYS = 60    # a longer gap between exposures starts a new visit
FSSPEC = {"block_size": 262144, "cache_type": "bytes"}


def find_images(ra, dec, det):
    """[(uri, mjd)] of every exposure of detector `det` covering the position."""
    q = (
        "SELECT a.uri, p.time_bounds_lower FROM spherex.artifact a "
        "JOIN spherex.plane p ON a.planeid = p.planeid "
        f"WHERE 1 = CONTAINS(POINT('ICRS', {ra}, {dec}), p.poly) "
        f"AND p.energy_bandpassname = 'SPHEREx-D{int(det)}' ORDER BY p.time_bounds_lower"
    )
    url = TAP + "?" + urllib.parse.urlencode({"FORMAT": "CSV", "QUERY": q})
    last = None
    for _ in range(3):
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                rows = list(csv.DictReader(io.StringIO(r.read().decode())))
            return [(x["uri"], float(x["time_bounds_lower"])) for x in rows]
        except Exception as e:
            last = e
    raise RuntimeError(f"IRSA image search failed: {type(last).__name__}")


def s3_url(uri):
    return S3 + uri.replace("ibe/data/spherex/", "", 1)


def open_remote(uri):
    return fits.open(s3_url(uri), use_fsspec=True, fsspec_kwargs=FSSPEC)


def grid_size(fov_arcsec):
    return int(fov_arcsec / OUT_SCALE)


def target_wcs(ra, dec, n):
    """North-up, east-left TAN grid of n x n pixels centred on the target."""
    w = WCS(naxis=2)
    w.wcs.ctype = ["RA---TAN", "DEC--TAN"]
    w.wcs.crval = [ra, dec]
    w.wcs.crpix = [(n + 1) / 2, (n + 1) / 2]
    w.wcs.cdelt = [-OUT_SCALE / 3600, OUT_SCALE / 3600]
    return w


def cut_box(wcs, shape, ra, dec, fov_arcsec):
    """Native-pixel box (y0, y1, x0, x1) around the target, or None at the edge."""
    half = int(fov_arcsec / NATIVE_SCALE / 2 * 1.5) + 2  # padded for rotation
    x, y = (int(round(float(v))) for v in wcs.all_world2pix(ra, dec, 0))
    ny, nx = shape
    y0, y1, x0, x1 = y - half, y + half + 1, x - half, x + half + 1
    if x0 < 0 or y0 < 0 or x1 > nx or y1 > ny:
        return None
    return y0, y1, x0, x1


def nearest_index(wcut, wout, n, shape):
    """For each output pixel, the nearest input pixel (yi, xi) and a validity mask."""
    yy, xx = np.indices((n, n))
    ra, dec = wout.all_pix2world(xx, yy, 0)
    xi, yi = wcut.all_world2pix(ra, dec, 0)
    xi, yi = np.rint(xi).astype(int), np.rint(yi).astype(int)
    ok = (xi >= 0) & (yi >= 0) & (xi < shape[1]) & (yi < shape[0])
    return np.clip(yi, 0, shape[0] - 1), np.clip(xi, 0, shape[1] - 1), ok


def group_visits(items):
    """Split [(mjd, payload)] sorted by time into visits; returns list of lists."""
    visits, last = [], None
    for mjd, payload in items:
        if last is None or mjd - last > VISIT_GAP_DAYS:
            visits.append([])
        visits[-1].append((mjd, payload))
        last = mjd
    return visits


def visit_date(mjds):
    return Time(float(np.mean(mjds)), format="mjd").strftime("%Y-%m-%d")

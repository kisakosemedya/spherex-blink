"""Shared SPHEREx data access: image search, AWS cutout reading, visit grouping.

Extracted from proof/make_frames.py so every module reads data the same way.
"""
import csv
import io
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import aiohttp
import numpy as np
from astropy.io import fits
from astropy.time import Time
from astropy.wcs import WCS

SIA = "https://irsa.ipac.caltech.edu/SIA"
COLLECTIONS = ("spherex_dr1", "spherex_dr1_deep", "spherex_qr3", "spherex_qr3_deep")
DETECTOR_EDGES_UM = (0.74, 1.10, 1.63, 2.42, 3.83, 4.42, 5.02)
S3 = "https://nasa-irsa-spherex.s3.amazonaws.com/"
OUT_SCALE = 3.0        # arcsec per output pixel (native is ~6.15)
NATIVE_SCALE = 6.15
VISIT_GAP_DAYS = 60    # a longer gap between exposures starts a new visit
FSSPEC = {
    "block_size": 262144,
    "cache_type": "bytes",
    "client_kwargs": {"timeout": aiohttp.ClientTimeout(total=12)},
}


def _search_collection(collection, ra, dec, det):
    # A wavelength in the middle of a detector cuts the result volume. The
    # archive detector label is checked again before using the result.
    wavelength = (DETECTOR_EDGES_UM[det - 1] + DETECTOR_EDGES_UM[det]) / 2e6
    query = urllib.parse.urlencode({
        "COLLECTION": collection,
        "POS": f"circle {ra:.4f} {dec:.4f} 0.0001",
        "RESPONSEFORMAT": "csv",
    })
    for attempt in range(2):
        url = f"{SIA}?{query}"
        if attempt == 0:
            url += f"&BAND={wavelength}"
        try:
            with urllib.request.urlopen(url, timeout=10) as response:
                reader = csv.DictReader(io.StringIO(response.read().decode("utf-8-sig")))
                if not {"access_url", "obs_id", "energy_bandpassname", "t_min"}.issubset(reader.fieldnames or []):
                    raise ValueError("unexpected SIA table")
                return [
                    (row["obs_id"], row["access_url"], float(row["t_min"]))
                    for row in reader
                    if row["energy_bandpassname"] == f"SPHEREx-D{det}"
                    and row["access_url"] and row["t_min"]
                ]
        except (OSError, ValueError) as error:
            if attempt == 1:
                raise RuntimeError(f"IRSA {collection} search failed: {error}") from error


def find_images(ra, dec, det):
    """Archive FITS URLs and times, plus any unavailable collections."""
    unavailable = []
    with ThreadPoolExecutor(max_workers=len(COLLECTIONS)) as executor:
        requests = {
            collection: executor.submit(_search_collection, collection, ra, dec, det)
            for collection in COLLECTIONS
        }
        images = {}
        for collection, request in requests.items():
            try:
                rows = request.result()
            except RuntimeError:
                unavailable.append(collection)
                continue
            for obs_id, uri, mjd in rows:
                # DR1 precedes QR3 in overlapping periods, and wide precedes deep
                # within a release when the same observation is listed twice.
                images.setdefault(obs_id, (uri, mjd))
    if not images and unavailable:
        raise RuntimeError(f"IRSA collections unavailable: {', '.join(unavailable)}")
    return sorted(images.values(), key=lambda row: row[1]), unavailable


def s3_url(uri):
    path = urllib.parse.urlsplit(uri).path.lstrip("/")
    return S3 + path.removeprefix("ibe/data/spherex/")


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

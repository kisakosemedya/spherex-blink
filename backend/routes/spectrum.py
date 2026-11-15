"""Quick-look 0.75–5 µm spectrum of a sky position from the SPHEREx DR1
all-sky spectral cube (HEALPix order 5 tiles, 512 × 512 × 102, 12.9″ pixels,
mean of the survey visits, zodiacal light removed).

GET /api/spectrum?ra=&dec=  ->  {channels: [{wavelength_um, flux_ujy, detector}], ...}

Only the 102 small row blocks around the position are read from the public
AWS copy, in parallel, instead of the ~100 MB tile.
"""
import re
import warnings
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import requests
from astropy.io import fits
from astropy.wcs import WCS
from fastapi import APIRouter, HTTPException, Query

from backend.core import cache

router = APIRouter()
CUBE = "https://nasa-irsa-spherex.s3.amazonaws.com/dr1/hips5_cube/hips_20261026/Norder5/Dir{d}/Npix{p}_cube.fits"
PIXEL_ARCSEC = 12.9
SR_PER_PIXEL = (PIXEL_ARCSEC / 206264.806) ** 2
R = 6  # half box, pixels
_session = requests.Session()


def _celestial(header):
    """2-D sky WCS of the cube (the spectral axis uses a -TAB lookup)."""
    h = header.copy()
    for k in list(h.keys()):
        if (re.match(r"^(CTYPE|CRVAL|CDELT|CRPIX|CUNIT|CNAME|CROTA)3$", k)
                or re.match(r"^(PC|CD)(3_\d|\d_3)$", k) or re.match(r"^P[SV]3_\d+$", k)):
            del h[k]
    h["NAXIS"] = 2
    h["WCSAXES"] = 2
    return WCS(h)


def _read_rows(url, start, length):
    for attempt in range(3):
        try:
            r = _session.get(url, headers={"Range": f"bytes={start}-{start + length - 1}"}, timeout=20)
            if r.status_code in (200, 206) and len(r.content) >= length:
                return r.content[:length]
        except requests.RequestException:
            pass
    return None


@router.get("/api/spectrum")
def spectrum(ra: float = Query(..., ge=0, lt=360), dec: float = Query(..., ge=-90, le=90)):
    ra, dec = round(ra, 4), round(dec, 4)
    key = f"spectrum_{ra:.4f}_{dec:.4f}"
    hit = cache.load(key)
    if hit:
        return hit
    with cache.lock(key):
        hit = cache.load(key)
        if hit:
            return hit
        import hpgeom  # here, so a missing package only disables this route
        ipix = int(hpgeom.angle_to_pixel(32, ra, dec, nest=True, lonlat=True))
        url = CUBE.format(d=(ipix // 10000) * 10000, p=ipix)
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                with fits.open(url, use_fsspec=True, lazy_load_hdus=True,
                               fsspec_kwargs={"block_size": 65536, "cache_type": "bytes"}) as h:
                    im = h["IMAGE"]
                    hdr = im.header
                    offset = im._data_offset
                    nz, ny, nx = hdr["NAXIS3"], hdr["NAXIS2"], hdr["NAXIS1"]
                    x, y = (float(v) for v in _celestial(hdr).all_world2pix(ra, dec, 0))
                    channels = h["SPECTRAL_CHANNELS"].data
                    wl = [float(v) for v in channels["WAVELENGTH"]]
                    det = [int(v) for v in channels["DETECTOR"]]
        except Exception:
            raise HTTPException(503, "the SPHEREx cube could not be read")
        xi, yi = int(round(x)), int(round(y))
        if not (R <= xi < nx - R and R <= yi < ny - R):
            raise HTTPException(404, "position too close to a cube tile edge")
        # one contiguous block of rows per channel, big-endian float32
        row_bytes = nx * 4
        length = (2 * R + 1) * row_bytes
        starts = [offset + ((z * ny) + (yi - R)) * row_bytes for z in range(nz)]
        with ThreadPoolExecutor(16) as ex:
            blocks = list(ex.map(lambda s: _read_rows(url, s, length), starts))
        yy, xx = np.mgrid[-R:R + 1, -R:R + 1]
        dist = np.hypot(xx - (x - xi), yy - (y - yi))
        aperture = dist <= 1.6
        wings = (dist >= 1.8) & (dist <= 3.4)      # used when the core is saturated (blank)
        annulus = (dist >= 4) & (dist <= R)
        grids = []
        for b in blocks:
            grids.append(None if b is None else
                         np.frombuffer(b, dtype=">f4").reshape(2 * R + 1, nx)[:, xi - R:xi + R + 1].astype(float))
        # A bright star leaves a blank (NaN) core in many channels; then the whole
        # spectrum is measured in the ring around it, so the channels stay comparable.
        blank_core = sum(g is not None and not np.isfinite(g[aperture]).all() for g in grids)
        use_wings = blank_core > 10
        region = wings if use_wings else aperture
        out = []
        for z, rows in enumerate(grids):
            flux = None
            if rows is not None:
                part, sky = rows[region], rows[annulus]
                ok = np.isfinite(part)
                if ok.sum() >= 0.7 * region.sum() and np.isfinite(sky).sum() > 10:
                    # scale a partly blank ring up to its full area
                    flux = float((part[ok] - np.nanmedian(sky)).sum() * region.sum() / ok.sum()
                                 * SR_PER_PIXEL * 1e12)  # MJy/sr -> µJy
            # channels 50 and 51 (0-based) are empty in DR1
            out.append({"wavelength_um": round(wl[z], 4), "detector": det[z],
                        "flux_ujy": None if flux is None else round(flux, 1)})
        n_missing = sum(c["flux_ujy"] is None for c in out)
        result = {"ra": ra, "dec": dec, "tile": ipix, "pixel_arcsec": PIXEL_ARCSEC,
                  "aperture_arcsec": round((3.4 if use_wings else 1.6) * PIXEL_ARCSEC, 1), "channels": out,
                  "n_missing": n_missing, "saturated": use_wings,
                  "method": "wings" if use_wings else "aperture",
                  "source": "SPHEREx DR1 all-sky spectral cube (NASA/IPAC IRSA), AWS copy"}
        cache.save(key, result)
        return result

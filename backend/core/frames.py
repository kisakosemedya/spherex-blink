"""Blink frames: one stacked image per SPHEREx visit of a sky position."""
import base64
import warnings
from concurrent.futures import ThreadPoolExecutor

import numpy as np
from astropy.wcs import WCS
from reproject import reproject_interp

from backend.core import cache
from backend.core import spherex as sx

MAX_PER_VISIT = 30  # deep fields have hundreds of exposures; a sample is enough


def frames_key(ra, dec, det, fov):
    return f"frames_{ra:.4f}_{dec:.4f}_D{det}_{fov:.0f}"


def _cutout(uri, ra, dec, fov, wout, n):
    """Background-subtracted cutout on the output grid, or None."""
    for _ in range(3):
        try:
            with sx.open_remote(uri) as hdul:
                hdu = hdul["IMAGE"]
                w = WCS(hdu.header)
                box = sx.cut_box(w, hdu.shape, ra, dec, fov)
                if box is None:
                    return None  # target too close to the detector edge
                y0, y1, x0, x1 = box
                data = np.array(hdu.section[y0:y1, x0:x1], dtype="float32")
                wcut = w[y0:y1, x0:x1]
            img, _ = reproject_interp((data, wcut), wout, shape_out=(n, n))
            # Removing each exposure's own median takes out the zodiacal light,
            # which otherwise makes whole frames flicker between seasons.
            return (img - np.nanmedian(img)).astype("float32")
        except Exception:
            continue  # transient network error: retry, then skip
    return None


def build_frames(ra, dec, det, fov):
    key = frames_key(ra, dec, det, fov)
    hit = cache.load(key)
    if hit:
        return hit
    with cache.lock(key):
        hit = cache.load(key)
        if hit:
            return hit
        n = sx.grid_size(fov)
        wout = sx.target_wcs(ra, dec, n)
        rows = sx.find_images(ra, dec, det)
        groups = sx.group_visits([(mjd, uri) for uri, mjd in rows])
        jobs = []
        for vi, g in enumerate(groups):
            if len(g) > MAX_PER_VISIT:
                pick = np.linspace(0, len(g) - 1, MAX_PER_VISIT).round().astype(int)
                g = [g[i] for i in pick]
            jobs += [(vi, mjd, uri) for mjd, uri in g]
        with ThreadPoolExecutor(8) as ex:
            imgs = list(ex.map(lambda j: _cutout(j[2], ra, dec, fov, wout, n), jobs))

        visits, skipped = [], 0
        for vi in range(len(groups)):
            got = [(j[1], im) for j, im in zip(jobs, imgs) if j[0] == vi and im is not None]
            skipped += sum(1 for j, im in zip(jobs, imgs) if j[0] == vi and im is None)
            if not got:
                continue
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", RuntimeWarning)  # all-NaN pixels
                stack = np.nanmedian(np.stack([im for _, im in got]), axis=0)
            mjds = [m for m, _ in got]
            visits.append({
                "date": sx.visit_date(mjds),
                "mjd": round(float(np.mean(mjds)), 3),
                "n_images": len(got),
                "n_available": len(groups[vi]),
                # float32 little-endian, row 0 = south, NaN = no usable data
                "data": base64.b64encode(stack.astype("<f4").tobytes()).decode(),
            })
        out = {
            "ra": ra, "dec": dec, "detector": det, "fov_arcsec": fov, "grid": n,
            "arcsec_per_pixel": sx.OUT_SCALE, "n_found": len(rows),
            "n_skipped": skipped, "visits": visits,
        }
        if visits:
            cache.save(key, out)
        return out

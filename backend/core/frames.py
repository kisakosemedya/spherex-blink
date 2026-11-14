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
PREVIEW_PER_VISIT = 6


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
            if not np.isfinite(img).any():
                return None
            # Removing each exposure's own median takes out the zodiacal light,
            # which otherwise makes whole frames flicker between seasons.
            return (img - np.nanmedian(img)).astype("float32")
        except Exception:
            continue  # transient network error: retry, then skip
    return None


def build_frames(ra, dec, det, fov, preview=False):
    full_key = frames_key(ra, dec, det, fov)
    key = f"{full_key}_preview" if preview else full_key
    hit = cache.load(full_key) or (cache.load(key) if preview else None)
    if hit:
        return hit
    with cache.lock(key):
        hit = cache.load(full_key) or (cache.load(key) if preview else None)
        if hit:
            return hit
        n = sx.grid_size(fov)
        wout = sx.target_wcs(ra, dec, n)
        rows, unavailable = sx.find_images(ra, dec, det)
        groups = sx.group_visits([(mjd, uri) for uri, mjd in rows])
        limit = PREVIEW_PER_VISIT if preview else MAX_PER_VISIT
        jobs = []
        for vi, g in enumerate(groups):
            if len(g) > limit:
                pick = np.linspace(0, len(g) - 1, limit).round().astype(int)
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
                "date_start": sx.visit_date([min(mjds)]),
                "date_end": sx.visit_date([max(mjds)]),
                "mjd": round(float(np.mean(mjds)), 3),
                "n_images": len(got),
                "n_available": len(groups[vi]),
                "releases": sorted({sx.s3_url(j[2]).split("/")[3].upper()
                                    for j, im in zip(jobs, imgs) if j[0] == vi and im is not None}),
                # float32 little-endian, row 0 = south, NaN = no usable data
                "data": base64.b64encode(stack.astype("<f4").tobytes()).decode(),
            })
        out = {
            "ra": ra, "dec": dec, "detector": det, "fov_arcsec": fov, "grid": n,
            "arcsec_per_pixel": sx.OUT_SCALE, "n_found": len(rows),
            "quality": "preview" if preview and any(len(g) > limit for g in groups) else "full",
            "unavailable_collections": unavailable,
            "n_skipped": skipped, "visits": visits,
        }
        if rows and not visits:
            raise RuntimeError("IRSA listed exposures but no usable FITS cutouts could be read")
        if visits and not unavailable:
            cache.save(key, out)
        return out

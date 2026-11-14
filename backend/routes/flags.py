"""Contamination flags overlay: where SPHEREx itself marked pixels as suspect.

GET /api/flags?ra=<deg>&dec=<deg>&det=<1-6>&fov=<arcsec>

For each visit, returns a transparent PNG on the same north-up grid as the
frames. A pixel's colour is the most common problem there and its opacity is
the share of that visit's exposures in which the problem was flagged.
Standalone check:  python -m backend.routes.flags 269.4462 4.7688 2 150
"""
import base64
import io
from concurrent.futures import ThreadPoolExecutor

import numpy as np
from astropy.wcs import WCS
from PIL import Image

from backend.core import cache
from backend.core import spherex as sx

# Plain-language groups of the FLAGS bits (names from the FLAGS header).
# Bit 21 SOURCE ("known source") is left out: it is set almost everywhere.
CATEGORIES = [
    {"id": "bright", "bits": [1, 15, 26], "color": [255, 159, 28],
     "tr": "Çok parlak yıldız taşması", "en": "Overflow from a very bright star"},
    {"id": "ghost", "bits": [20, 22, 23, 24, 25], "color": [255, 71, 179],
     "tr": "Yansıma ya da sahte görüntü", "en": "Reflection or false image"},
    {"id": "transient", "bits": [0, 27, 28], "color": [76, 201, 240],
     "tr": "Anlık parlama (çoğunlukla kozmik ışın)", "en": "Momentary flash (mostly cosmic rays)"},
    {"id": "persist", "bits": [17], "color": [255, 230, 80],
     "tr": "Önceki pozdan kalan iz", "en": "Afterglow from an earlier exposure"},
    {"id": "badpix", "bits": [2, 6, 9, 10, 11], "color": [255, 60, 60],
     "tr": "Bozuk ya da veri gelmeyen piksel", "en": "Broken pixel or missing data"},
]
MASKS = [sum(1 << b for b in c["bits"]) for c in CATEGORIES]
MIN_SHARE = 0.15  # hide problems seen in fewer than 15% of a visit's exposures



def _one_exposure(uri, ra, dec, fov, wout, n):
    """(n_categories, n, n) float array: 1 flagged, 0 clean, NaN no data."""
    for _ in range(3):
        try:
            with sx.open_remote(uri) as hdul:
                w = WCS(hdul["IMAGE"].header)
                box = sx.cut_box(w, hdul["IMAGE"].shape, ra, dec, fov)
                if box is None:
                    return None
                y0, y1, x0, x1 = box
                flags = np.array(hdul["FLAGS"].section[y0:y1, x0:x1])
            yi, xi, ok = sx.nearest_index(w[y0:y1, x0:x1], wout, n, flags.shape)
            f = flags[yi, xi]
            out = np.stack([((f & m) != 0).astype("float32") for m in MASKS])
            out[:, ~ok] = np.nan
            return out
        except Exception:
            continue  # transient network error: retry, then skip this exposure
    return None


def flags_overlay(ra, dec, det, fov):
    key = f"flags_{ra:.4f}_{dec:.4f}_D{det}_{fov:.0f}"
    hit = cache.load(key)
    if hit:
        return hit

    n = sx.grid_size(fov)
    wout = sx.target_wcs(ra, dec, n)
    rows = sx.find_images(ra, dec, det)
    with ThreadPoolExecutor(8) as ex:
        res = list(ex.map(lambda r: _one_exposure(r[0], ra, dec, fov, wout, n), rows))
    good = [(mjd, a) for (_, mjd), a in zip(rows, res) if a is not None]

    visits = []
    for v in sx.group_visits(good):
        share = np.nanmean(np.stack([a for _, a in v]), axis=0)  # (cat, n, n)
        share = np.nan_to_num(share)
        top = share.argmax(axis=0)
        top_share = share.max(axis=0)
        rgba = np.zeros((n, n, 4), dtype="uint8")
        for i, c in enumerate(CATEGORIES):
            sel = (top == i) & (top_share >= MIN_SHARE)
            rgba[sel, :3] = c["color"]
            rgba[sel, 3] = (60 + 160 * top_share[sel]).astype("uint8")
        buf = io.BytesIO()
        Image.fromarray(np.flipud(rgba)).save(buf, format="PNG")  # row 0 = north
        visits.append({
            "date": sx.visit_date([m for m, _ in v]),
            "n_images": len(v),
            "png": "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode(),
            # share of the field flagged in at least half of the exposures
            "affected_percent": {
                c["id"]: round(100 * float((share[i] >= 0.5).mean()), 1)
                for i, c in enumerate(CATEGORIES)
            },
        })
    out = {
        "ra": ra, "dec": dec, "detector": det, "fov_arcsec": fov, "grid": n,
        "n_exposures": len(good), "n_skipped": len(rows) - len(good),
        "categories": [{k: c[k] for k in ("id", "color", "tr", "en")} for c in CATEGORIES],
        "visits": visits,
    }
    if visits:
        cache.save(key, out)
    return out


try:  # the route is only defined when FastAPI is installed
    from fastapi import APIRouter, HTTPException, Query

    router = APIRouter()

    @router.get("/api/flags")
    def flags_route(
        ra: float = Query(..., ge=0, lt=360),
        dec: float = Query(..., ge=-90, le=90),
        det: int = Query(2, ge=1, le=6),
        fov: float = Query(150, ge=20, le=600),
    ):
        try:
            return flags_overlay(ra, dec, det, fov)
        except RuntimeError as e:
            raise HTTPException(503, str(e))
except ImportError:
    router = None


if __name__ == "__main__":
    import sys
    import time
    a = sys.argv
    t = time.time()
    r = flags_overlay(float(a[1]), float(a[2]), int(a[3]) if len(a) > 3 else 2,
                      float(a[4]) if len(a) > 4 else 150.0)
    print(f"{r['n_exposures']} exposures, {r['n_skipped']} skipped, {time.time() - t:.0f}s")
    for v in r["visits"]:
        print(" ", v["date"], v["n_images"], "poz", v["affected_percent"], f"png {len(v['png']) // 1024} KB")

"""SPHEREx Blink server.

    uvicorn backend.app:app --port 8000        (run from the repository root)

Core endpoints live here. Every file in backend/routes/ that defines `router`
is added automatically, and every .js file in frontend/modules/ is loaded by
the page, so a new feature never needs a change to this file.
"""
import importlib
import pkgutil
import re
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Literal

import astropy.units as u
from astropy.coordinates import SkyCoord
from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles

import backend.routes as routes_pkg
from backend.core.frames import build_frames
from backend.core.targets import TARGETS, find_preset

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "frontend"
# CDS Sesame and its mirrors. In November 2026 the main CDS host answered in
# ~30 s while the Harvard mirror answered in under a second, so the mirror is
# tried first with a short timeout and CDS stays as the fallback.
SESAME = [
    ("https://vizier.cfa.harvard.edu/viz-bin/nph-sesame/-oI/SNV?", 6),
    ("https://cds.unistra.fr/cgi-bin/nph-sesame/-oI/SNV?", 12),
]

app = FastAPI(title="SPHEREx Blink")


@app.get("/api/targets")
def targets():
    return TARGETS


@app.get("/api/modules")
def modules():
    return sorted(p.name for p in (FRONTEND / "modules").glob("*.js"))


@app.get("/api/frames")
def frames(
    ra: float = Query(..., ge=0, lt=360),
    dec: float = Query(..., ge=-90, le=90),
    det: int = Query(2, ge=1, le=6),
    fov: float = Query(150, ge=60, le=600),
    quality: Literal["preview", "full"] = "full",
):
    try:
        out = build_frames(round(ra, 4), round(dec, 4), det, float(round(fov)), preview=quality == "preview")
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    if not out["visits"]:
        raise HTTPException(404, "no SPHEREx data at this position")
    return out


def _parse_coordinates(q):
    nums = re.findall(r"[-+]?\d+(?:\.\d+)?", q)
    if len(nums) == 2 and not re.search(r"[a-zA-Z:]", q):
        ra, dec = float(nums[0]), float(nums[1])
        if 0 <= ra < 360 and -90 <= dec <= 90:
            return ra, dec
    if len(nums) == 6:  # sexagesimal: hours and degrees
        try:
            c = SkyCoord(q, unit=(u.hourangle, u.deg))
            return float(c.ra.deg), float(c.dec.deg)
        except Exception:
            return None
    return None


@app.get("/api/resolve")
def resolve(q: str = Query(..., min_length=1, max_length=80)):
    q = q.strip()
    preset = find_preset(q)
    if preset:
        return {"source": "preset", "id": preset["id"], "ra": preset["ra"], "dec": preset["dec"],
                "det": preset["det"], "fov": preset["fov"]}
    coords = _parse_coordinates(q)
    if coords:
        return {"source": "coordinates", "ra": round(coords[0], 5), "dec": round(coords[1], 5)}
    answered = False
    for base, timeout in SESAME:
        try:
            with urllib.request.urlopen(base + urllib.parse.quote(q), timeout=timeout) as r:
                text = r.read().decode(errors="replace")
        except Exception:
            continue  # try the next mirror
        answered = True
        m = re.search(r"^%J\s+([-+\d.]+)\s+([-+\d.]+)", text, re.M)
        if m:
            return {"source": "sesame", "name": q, "ra": round(float(m.group(1)), 5),
                    "dec": round(float(m.group(2)), 5)}
    if answered:
        raise HTTPException(404, "name not found")
    raise HTTPException(503, "name service unreachable")


for info in pkgutil.iter_modules(routes_pkg.__path__):
    module = importlib.import_module(f"backend.routes.{info.name}")
    if getattr(module, "router", None) is not None:
        app.include_router(module.router)

app.mount("/", StaticFiles(directory=FRONTEND, html=True), name="frontend")

"""Gaia DR3 overlay: known stars in the field, moved to each visit date.

GET /api/gaia?ra=<deg>&dec=<deg>&fov=<arcsec>&dates=2025-08-26,2026-03-17

Gaia positions are for epoch 2016.0. Each star is propagated with its proper
motion to every requested date, so the overlay circle moves with the star.
Standalone check:  python backend/routes/gaia.py 269.4462 4.7688 150
"""
import csv
import io
import math
import time
import urllib.parse
import urllib.request
from datetime import date
from typing import List, Optional

GAIA_EPOCH = 2016.0
MAX_STARS = 200
TIMEOUT_S = 20
# Fast stars have drifted since 2016 (Barnard's Star: ~110 arcsec), so the
# catalogue search reaches this far beyond the field before we filter.
PM_MARGIN_ARCSEC = 150.0

ESA_TAP = "https://gea.esac.esa.int/tap-server/tap/sync"
VIZIER_TAP = "https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync"


def _tap_csv(url, query):
    data = urllib.parse.urlencode(
        {"REQUEST": "doQuery", "LANG": "ADQL", "FORMAT": "csv", "QUERY": query}
    ).encode()
    with urllib.request.urlopen(url, data=data, timeout=TIMEOUT_S) as r:
        return list(csv.DictReader(io.StringIO(r.read().decode())))


def _num(v):
    try:
        x = float(v)
        return None if math.isnan(x) else x
    except (TypeError, ValueError):
        return None


def _query_esa(ra, dec, radius_deg):
    q = (
        f"SELECT TOP {MAX_STARS} source_id, ra, dec, pmra, pmdec, phot_g_mean_mag "
        "FROM gaiadr3.gaia_source WHERE 1=CONTAINS(POINT('ICRS', ra, dec), "
        f"CIRCLE('ICRS', {ra}, {dec}, {radius_deg})) ORDER BY phot_g_mean_mag"
    )
    return [
        {"source_id": r["source_id"], "ra": _num(r["ra"]), "dec": _num(r["dec"]),
         "pmra": _num(r["pmra"]), "pmdec": _num(r["pmdec"]),
         "g_mag": _num(r["phot_g_mean_mag"])}
        for r in _tap_csv(ESA_TAP, q)
    ]


def _query_vizier(ra, dec, radius_deg):
    q = (
        f"SELECT TOP {MAX_STARS} Source, RA_ICRS, DE_ICRS, pmRA, pmDE, Gmag "
        'FROM "I/355/gaiadr3" WHERE 1=CONTAINS(POINT(\'ICRS\', RA_ICRS, DE_ICRS), '
        f"CIRCLE('ICRS', {ra}, {dec}, {radius_deg})) ORDER BY Gmag"
    )
    return [
        {"source_id": r["Source"], "ra": _num(r["RA_ICRS"]), "dec": _num(r["DE_ICRS"]),
         "pmra": _num(r["pmRA"]), "pmdec": _num(r["pmDE"]), "g_mag": _num(r["Gmag"])}
        for r in _tap_csv(VIZIER_TAP, q)
    ]


def _decimal_year(iso):
    d = date.fromisoformat(iso)
    start = date(d.year, 1, 1)
    return d.year + (d - start).days / ((date(d.year + 1, 1, 1) - start).days)


def _propagate(star, year):
    """Position at `year`. pmra already includes cos(dec); units mas/yr."""
    dt = year - GAIA_EPOCH
    dec = star["dec"] + (star["pmdec"] or 0.0) * dt / 3.6e6
    ra = star["ra"] + (star["pmra"] or 0.0) * dt / 3.6e6 / math.cos(math.radians(star["dec"]))
    return ra % 360.0, dec


def _offset_arcsec(ra, dec, ra0, dec0):
    dx = ((ra - ra0 + 180) % 360 - 180) * math.cos(math.radians(dec0)) * 3600
    return dx, (dec - dec0) * 3600


def gaia_overlay(ra, dec, fov_arcsec, dates):
    """Stars inside the square field at any of `dates`, brightest first."""
    half = fov_arcsec / 2.0
    radius_deg = (half * math.sqrt(2) + PM_MARGIN_ARCSEC) / 3600.0
    rows, source, errors = None, None, []
    for name, fn in (("ESA Gaia Archive", _query_esa), ("VizieR", _query_vizier)):
        for attempt in range(2):
            try:
                rows, source = fn(ra, dec, radius_deg), name
                break
            except Exception as e:  # network trouble: retry, then fall back
                errors.append(f"{name}: {type(e).__name__}")
                time.sleep(1)
        if rows is not None:
            break
    if rows is None:
        raise RuntimeError("Gaia services unreachable (" + "; ".join(errors) + ")")

    years = [(d, _decimal_year(d)) for d in dates]
    stars = []
    for s in rows:
        if s["ra"] is None or s["dec"] is None:
            continue
        positions, inside = [], False
        for d, y in years:
            r, dd = _propagate(s, y)
            dx, dy = _offset_arcsec(r, dd, ra, dec)
            inside = inside or (abs(dx) <= half and abs(dy) <= half)
            positions.append({"date": d, "ra": round(r, 7), "dec": round(dd, 7)})
        if not inside:
            continue
        pm = math.hypot(s["pmra"] or 0.0, s["pmdec"] or 0.0) / 1000.0
        stars.append({
            "source_id": s["source_id"],
            "g_mag": None if s["g_mag"] is None else round(s["g_mag"], 2),
            "pm_arcsec_yr": round(pm, 3),
            "has_pm": s["pmra"] is not None,
            "positions": positions,
        })
    return {"catalog": "Gaia DR3", "service": source, "gaia_epoch": GAIA_EPOCH,
            "dates": dates, "n_stars": len(stars), "stars": stars}


try:  # the route is only defined when FastAPI is installed
    from fastapi import APIRouter, HTTPException, Query

    router = APIRouter()

    @router.get("/api/gaia")
    def gaia_route(
        ra: float = Query(..., ge=0, lt=360),
        dec: float = Query(..., ge=-90, le=90),
        fov: float = Query(150, ge=20, le=1200),
        dates: Optional[str] = None,
    ):
        try:
            ds: List[str] = [d.strip() for d in dates.split(",")] if dates else [date.today().isoformat()]
            for d in ds:
                date.fromisoformat(d)
        except ValueError:
            raise HTTPException(400, "dates must be comma-separated YYYY-MM-DD")
        try:
            return gaia_overlay(ra, dec, fov, ds)
        except RuntimeError as e:
            raise HTTPException(503, str(e))
except ImportError:
    router = None


if __name__ == "__main__":
    import sys
    ra_, dec_ = float(sys.argv[1]), float(sys.argv[2])
    fov_ = float(sys.argv[3]) if len(sys.argv) > 3 else 150.0
    ds_ = sys.argv[4].split(",") if len(sys.argv) > 4 else ["2025-08-26", "2026-03-17", "2026-08-23"]
    out = gaia_overlay(ra_, dec_, fov_, ds_)
    print(out["service"], "-", out["n_stars"], "stars in field")
    for s in out["stars"][:8]:
        p0, p1 = s["positions"][0], s["positions"][-1]
        dx, dy = _offset_arcsec(p0["ra"], p0["dec"], ra_, dec_)
        mx, my = _offset_arcsec(p1["ra"], p1["dec"], p0["ra"], p0["dec"])
        print(f"  G={s['g_mag']}  pm={s['pm_arcsec_yr']}\"/yr  offset=({dx:+.1f},{dy:+.1f})\"  "
              f"moved=({mx:+.1f},{my:+.1f})\"")

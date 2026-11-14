"""Download NEOSSat (Canadian Space Agency) images of Barnard's Star from one
night of its 2019 campaign.

The image list comes from the CADC archive (TAP, collection NEOSSAT). Files
are downloaded from CADC, which holds byte-identical copies of the CSA open
data; the CSA server is the fallback. (In November 2026 the CSA server sent an
incomplete TLS certificate chain, which Python rejects; certificate checks are
never disabled here.) About 54 files, 24 MB.

Usage: python fetch_neossat.py OUT_DIR [NIGHT=2019-10-18]
"""
import csv, io, sys, time
from pathlib import Path

import requests

CADC_TAP = "https://ws.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/argus/sync"
CADC_DATA = "https://ws.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/data/pub/NEOSSAT/"
CSA = "https://data.asc-csa.gc.ca/users/OpenData_DonneesOuvertes/pub/NEOSSAT/ASTRO/"
RA, DEC = 269.4462, 4.7688  # any point inside the field works


def get(url, **kw):
    for attempt in range(3):
        try:
            r = requests.get(url, timeout=180, **kw)
            r.raise_for_status()
            return r
        except requests.RequestException as e:
            err = e
            time.sleep(3)
    raise err


def main():
    out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    night = sys.argv[2] if len(sys.argv) > 2 else "2019-10-18"
    q = ("SELECT o.observationID, p.time_bounds_lower FROM caom2.Plane p "
         "JOIN caom2.Observation o ON p.obsID = o.obsID "
         "WHERE o.collection = 'NEOSSAT' AND o.target_name = 'BarnardStar' "
         "AND p.calibrationLevel = 1 "
         f"AND INTERSECTS(POINT('ICRS', {RA}, {DEC}), p.position_bounds) = 1 "
         "ORDER BY p.time_bounds_lower")
    rows = list(csv.DictReader(io.StringIO(
        get(CADC_TAP, params={"LANG": "ADQL", "FORMAT": "csv", "QUERY": q}).text)))
    print(f"NEOSSat images of Barnard's Star in CADC: {len(rows)}")

    # observationID is YYYYDDDhhmmss (year, day of year, UTC time)
    from datetime import datetime
    day = datetime.strptime(night, "%Y-%m-%d").strftime("%Y%j")
    ids = [r["observationID"] for r in rows if r["observationID"].startswith(day)]
    print(f"on {night}: {len(ids)}")
    for i, oid in enumerate(ids, 1):
        name = f"NEOS_SCI_{oid}.fits"
        dest = out / name
        if dest.exists() and dest.stat().st_size > 0:
            continue
        urls = [CADC_DATA + name, f"{CSA}{oid[:4]}/{oid[4:7]}/{name}"]
        for url in urls:
            try:
                dest.write_bytes(get(url).content)
                break
            except requests.RequestException as e:
                err = e
        else:
            print("  skipped", name, repr(err)[:80])
        if i % 10 == 0:
            print(f"  {i}/{len(ids)}")
    print("done:", out)


if __name__ == "__main__":
    main()

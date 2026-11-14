"""SPHEREx blink proof: fetch small cutouts around a sky position from the
AWS mirror (range requests, no IRSA cutout service), group them by visit
(~6-month epochs), stack each visit and save frames + a preview PNG.

Usage: python make_frames.py NAME RA_DEG DEC_DEG [DETECTOR=2] [FOV_ARCSEC=150]
"""
import csv, io, json, sys, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from astropy.io import fits
from astropy.time import Time
from astropy.wcs import WCS
from reproject import reproject_interp

TAP = "https://irsa.ipac.caltech.edu/TAP/sync"
S3 = "https://nasa-irsa-spherex.s3.amazonaws.com/"
OUT_SCALE = 3.0  # arcsec per output pixel (native is ~6.2)


def find_images(ra, dec, det):
    q = (
        "SELECT a.uri, p.time_bounds_lower FROM spherex.artifact a "
        "JOIN spherex.plane p ON a.planeid = p.planeid "
        f"WHERE 1 = CONTAINS(POINT('ICRS', {ra}, {dec}), p.poly) "
        f"AND p.energy_bandpassname = 'SPHEREx-D{det}' ORDER BY p.time_bounds_lower"
    )
    url = TAP + "?" + urllib.parse.urlencode({"FORMAT": "CSV", "QUERY": q})
    with urllib.request.urlopen(url, timeout=120) as r:
        rows = list(csv.DictReader(io.StringIO(r.read().decode())))
    return [(x["uri"], float(x["time_bounds_lower"])) for x in rows]


def target_wcs(ra, dec, n):
    w = WCS(naxis=2)
    w.wcs.ctype = ["RA---TAN", "DEC--TAN"]
    w.wcs.crval = [ra, dec]
    w.wcs.crpix = [(n + 1) / 2, (n + 1) / 2]
    w.wcs.cdelt = [-OUT_SCALE / 3600, OUT_SCALE / 3600]
    return w


def fetch(uri, ra, dec, wout, n, half):
    url = S3 + uri.replace("ibe/data/spherex/", "", 1)
    for attempt in range(3):
        try:
            with fits.open(url, use_fsspec=True,
                           fsspec_kwargs={"block_size": 131072, "cache_type": "bytes"}) as hdul:
                hdu = hdul["IMAGE"]
                w = WCS(hdu.header)
                x, y = (float(v) for v in w.all_world2pix(ra, dec, 0))
                ny, nx = hdu.shape
                x0, x1 = int(round(x)) - half, int(round(x)) + half + 1
                y0, y1 = int(round(y)) - half, int(round(y)) + half + 1
                if x0 < 0 or y0 < 0 or x1 > nx or y1 > ny:
                    return None  # target too close to the detector edge
                data = np.array(hdu.section[y0:y1, x0:x1], dtype="float32")
                wcut = w[y0:y1, x0:x1]
            img, _ = reproject_interp((data, wcut), wout, shape_out=(n, n))
            return img - np.nanmedian(img)  # removes zodiacal/background level
        except Exception as e:  # transient network errors: retry
            err = e
    print("  failed:", uri.rsplit("/", 1)[-1], repr(err)[:80])
    return None


def main():
    name, ra, dec = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
    det = int(sys.argv[4]) if len(sys.argv) > 4 else 2
    fov = float(sys.argv[5]) if len(sys.argv) > 5 else 150.0
    n = int(fov / OUT_SCALE)
    half = int(fov / 6.15 / 2 * 1.5) + 2  # native pixels, padded for rotation
    out = Path(__file__).parent / "out"
    out.mkdir(exist_ok=True)

    rows = find_images(ra, dec, det)
    print(f"{name}: {len(rows)} images in detector {det}")
    wout = target_wcs(ra, dec, n)
    with ThreadPoolExecutor(8) as ex:
        imgs = list(ex.map(lambda r: fetch(r[0], ra, dec, wout, n, half), rows))
    good = [(t, im) for (_, t), im in zip(rows, imgs) if im is not None]
    print(f"  usable cutouts: {len(good)}")

    # group into visits: a gap of more than 60 days starts a new visit
    visits, last = [], None
    for t, im in good:
        if last is None or t - last > 60:
            visits.append([])
        visits[-1].append((t, im))
        last = t

    frames, meta = [], []
    for v in visits:
        ts = [t for t, _ in v]
        frames.append(np.nanmedian(np.stack([im for _, im in v]), axis=0))
        meta.append({"date": Time(np.mean(ts), format="mjd").strftime("%Y-%m-%d"),
                     "n_images": len(v)})
        print("  visit", meta[-1])
    frames = np.stack(frames).astype("float32")
    np.save(out / f"{name}_D{det}.npy", frames)
    (out / f"{name}_D{det}.json").write_text(json.dumps(
        {"name": name, "ra": ra, "dec": dec, "detector": det, "fov_arcsec": fov,
         "arcsec_per_pixel": OUT_SCALE, "visits": meta}, indent=1))

    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    k = len(frames)
    vmax = np.nanpercentile(frames, 99.7)
    fig, ax = plt.subplots(1, k + 1, figsize=(4 * (k + 1), 4.3))
    for i in range(k):
        ax[i].imshow(frames[i], origin="lower", cmap="gray", vmin=-0.02 * vmax, vmax=vmax)
        ax[i].set_title(f"{meta[i]['date']}  ({meta[i]['n_images']} poz)")
    d = frames[-1] - frames[0]
    s = np.nanpercentile(np.abs(d), 99.7)
    ax[k].imshow(d, origin="lower", cmap="RdBu_r", vmin=-s, vmax=s)
    ax[k].set_title("fark: son − ilk")
    for a in ax:
        a.axhline(n / 2 - 0.5, color="y", lw=0.4)
        a.axvline(n / 2 - 0.5, color="y", lw=0.4)
        a.set_xticks([]); a.set_yticks([])
    fig.suptitle(f"{name} · SPHEREx dedektör {det} · {fov:.0f}″ alan · kuzey yukarı")
    fig.tight_layout()
    fig.savefig(out / f"{name}_D{det}.png", dpi=110)
    print("  saved", out / f"{name}_D{det}.png")


if __name__ == "__main__":
    main()

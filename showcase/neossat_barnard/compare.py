"""Put the NEOSSat 2019 stack and SPHEREx visit stacks on one grid, measure
Barnard's Star in each, compare with Gaia DR3, and write a blink GIF + figure.

SPHEREX_NPY / SPHEREX_JSON are the visit stacks written by proof/make_frames.py.

Usage: python compare.py NEOSSAT_STACK.fits SPHEREX_NPY SPHEREX_JSON OUT_DIR
"""
import io, json, sys
import numpy as np, requests
from astropy.io import fits
from astropy.time import Time
from astropy.wcs import WCS
from astropy.coordinates import SkyCoord
import astropy.units as u
from reproject import reproject_interp
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image

neo_path, npy, js, out = sys.argv[1:]
meta = json.load(open(js))
ra0, dec0, scale = meta["ra"], meta["dec"], meta["arcsec_per_pixel"]
sx = np.load(npy)
n = sx.shape[1]
w = WCS(naxis=2)
w.wcs.ctype = ["RA---TAN", "DEC--TAN"]; w.wcs.crval = [ra0, dec0]
w.wcs.crpix = [(n + 1) / 2, (n + 1) / 2]; w.wcs.cdelt = [-scale / 3600, scale / 3600]

with fits.open(neo_path) as h:
    neo_img, neo_hdr = h[0].data.astype(float), h[0].header
neo_mjd = neo_hdr["MJD-OBS"]
neo, _ = reproject_interp((neo_img, WCS(neo_hdr)), w, shape_out=(n, n))

# Gaia DR3 Barnard's Star
q = ("SELECT ra, dec, pmra, pmdec, parallax FROM gaiadr3.gaia_source "
     "WHERE source_id = 4472832130942575872")
r = requests.get("https://gea.esac.esa.int/tap-server/tap/sync",
                 params={"REQUEST": "doQuery", "LANG": "ADQL", "FORMAT": "csv", "QUERY": q}, timeout=120)
vals = dict(zip(*[l.split(",") for l in r.text.strip().splitlines()]))
g = {k: float(v) for k, v in vals.items()}
print("Gaia DR3:", g)

def gaia_pos(mjd):
    dt = Time(mjd, format="mjd").decimalyear - 2016.0
    dec = g["dec"] + g["pmdec"] * dt / 3.6e6
    ra = g["ra"] + g["pmra"] * dt / 3.6e6 / np.cos(np.radians(dec))
    return ra, dec

def centroid(img, ra, dec, box=6):
    x, y = w.world_to_pixel(SkyCoord(ra * u.deg, dec * u.deg))
    xi, yi = int(round(float(x))), int(round(float(y)))
    for _ in range(3):
        sub = np.nan_to_num(img[yi-box:yi+box+1, xi-box:xi+box+1])
        sub = sub - np.median(sub); sub[sub < 0] = 0
        yy, xx = np.mgrid[yi-box:yi+box+1, xi-box:xi+box+1]
        cx, cy = (xx * sub).sum() / sub.sum(), (yy * sub).sum() / sub.sum()
        xi, yi = int(round(cx)), int(round(cy))
    c = w.pixel_to_world(cx, cy)
    return c.ra.deg, c.dec.deg

frames = [("NEOSSat (CSA) · optical", Time(neo_mjd, format="mjd"), neo)]
# SPHEREx visit mean dates from json
for i, v in enumerate(meta["visits"]):
    frames.append((f"SPHEREx (NASA) · 0.75–1.09 µm", Time(v["date"]), sx[i]))

rows = []
for name, t, img in frames:
    gr, gd = gaia_pos(t.mjd)
    mr, md = centroid(img, gr, gd)
    sep = SkyCoord(mr*u.deg, md*u.deg).separation(SkyCoord(gr*u.deg, gd*u.deg)).arcsec
    rows.append((name, t, mr, md, gr, gd, sep))
    print(f"{t.iso[:10]}  {name:32s} measured ({mr:.5f}, {md:.5f})  gaia ({gr:.5f}, {gd:.5f})  diff {sep:.2f}\"")

first, last = rows[0], rows[-1]
moved = SkyCoord(first[2]*u.deg, first[3]*u.deg).separation(SkyCoord(last[2]*u.deg, last[3]*u.deg)).arcsec
pred = SkyCoord(first[4]*u.deg, first[5]*u.deg).separation(SkyCoord(last[4]*u.deg, last[5]*u.deg)).arcsec
yrs = last[1].decimalyear - first[1].decimalyear
print(f"\nNEOSSat 2019 -> SPHEREx {last[1].iso[:10]}: {yrs:.2f} yr")
print(f"measured shift {moved:.1f}\"  ({moved/yrs:.2f}\"/yr)   Gaia-predicted {pred:.1f}\"  ({pred/yrs:.2f}\"/yr)")
json.dump({"years": yrs, "measured_arcsec": moved, "gaia_arcsec": pred,
           "rows": [{"label": a, "date": b.iso[:10], "ra": c, "dec": d, "gaia_ra": e, "gaia_dec": f, "offset_arcsec": s}
                    for a, b, c, d, e, f, s in rows]}, open(out + "/barnard_neossat_spherex.json", "w"), indent=1)

# ---- figure + GIF
def norm(img):
    a = np.nan_to_num(img - np.nanmedian(img))
    hi = np.nanpercentile(a, 99.7)
    return np.clip(a / hi, 0, 1) ** 0.5

pngs = []
for name, t, mr, md, gr, gd, s in rows:
    img = [f for f in frames if f[1] == t][0][2]
    fig, ax = plt.subplots(figsize=(5, 5.4))
    ax.imshow(norm(img), origin="lower", cmap="gray")
    for (nm, tt, r_, d_, *_ ) in rows:
        x, y = w.world_to_pixel(SkyCoord(r_*u.deg, d_*u.deg))
        ax.plot(x, y, "o", ms=14, mfc="none", mec="#f5c518" if tt == t else "#4aa3ff", mew=1.2, alpha=1 if tt == t else 0.5)
    ax.set_title(f"{t.iso[:10]}\n{name}", fontsize=11, color="white")
    ax.set_xticks([]); ax.set_yticks([])
    ax.text(0.02, 0.02, "north up · 330″ field · Barnard's Star", color="w", fontsize=8, transform=ax.transAxes)
    fig.tight_layout()
    buf = io.BytesIO(); fig.savefig(buf, dpi=90, facecolor="black"); plt.close(fig)
    pngs.append(Image.open(buf).convert("RGB"))
pngs[0].save(out + "/barnard_neossat_spherex.gif", save_all=True, append_images=pngs[1:], duration=900, loop=0, disposal=2, optimize=False)

fig, ax = plt.subplots(1, len(rows), figsize=(4.2 * len(rows), 4.6))
for a, (name, t, mr, md, gr, gd, s) in zip(ax, rows):
    img = [f for f in frames if f[1] == t][0][2]
    a.imshow(norm(img), origin="lower", cmap="gray")
    x, y = w.world_to_pixel(SkyCoord(gr*u.deg, gd*u.deg))
    a.plot(x, y, "+", color="#ff5a5a", ms=16, mew=1)
    x0, y0 = w.world_to_pixel(SkyCoord(rows[0][2]*u.deg, rows[0][3]*u.deg))
    a.plot(x0, y0, "o", ms=14, mfc="none", mec="#4aa3ff", mew=1)
    a.set_title(f"{t.iso[:10]} · {name.split(' ·')[0]}", fontsize=10)
    a.set_xticks([]); a.set_yticks([])
fig.suptitle(f"Barnard's Star: {moved:.0f}″ in {yrs:.1f} years (Gaia predicts {pred:.0f}″). "
             "Blue circle = 2019 position, red + = Gaia prediction for that date", fontsize=10)
fig.tight_layout(); fig.savefig(out + "/barnard_neossat_spherex.png", dpi=100)
print("saved GIF, PNG, JSON to", out)

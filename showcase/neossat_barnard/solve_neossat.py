"""Stack NEOSSat Barnard 2019 frames and solve their astrometry against Gaia DR3.

NEOSSat raw frames carry only a coarse pointing, no sky solution (WCS). This
script stacks the frames, detects stars, matches them to Gaia DR3 (moved to the
NEOSSat date with proper motion) and fits a TAN WCS. Barnard's Star itself is
left out of the fit, so its measured position stays independent of Gaia.

Usage: python solve_neossat.py FITS_DIR OUT_DIR
Writes OUT_DIR/neossat_stack.fits (with fitted WCS) and prints diagnostics.
"""
import csv, glob, io, sys, urllib.parse
import numpy as np
import requests
from astropy.io import fits
from astropy.time import Time
from astropy.wcs import WCS
from astropy.wcs.utils import fit_wcs_from_points
from astropy.coordinates import SkyCoord
import astropy.units as u
from scipy import ndimage

fdir, out = sys.argv[1], sys.argv[2]
files = sorted(glob.glob(fdir + "/NEOS_SCI_*.fits"))

# --- 1. read science region (last 256 columns), subtract overscan level
imgs, times = [], []
for f in files:
    with fits.open(f) as h:
        d = h[0].data.astype(float)
        hdr = h[0].header
    if hdr.get("OBJECT", "").strip() != "BarnardStar":
        continue
    sci = d[:, -256:]
    bias = np.median(d[:, 2:60])
    imgs.append(sci - bias)
    times.append(Time(hdr["DATE-OBS"]).mjd)
imgs = np.array(imgs)
print("frames:", len(imgs))

# --- 2. align frames on the brightest star (integer + subpixel shift) and median-stack
ref = imgs[0]
def peak(a):
    s = ndimage.gaussian_filter(a, 1.5)
    y, x = np.unravel_index(np.argmax(s), s.shape)
    w = s[max(y-4,0):y+5, max(x-4,0):x+5]
    yy, xx = np.mgrid[max(y-4,0):y+5, max(x-4,0):x+5]
    w = w - w.min()
    return (yy*w).sum()/w.sum(), (xx*w).sum()/w.sum()
p0 = peak(ref)
aligned = [ndimage.shift(im, (p0[0]-peak(im)[0], p0[1]-peak(im)[1]), order=1, mode="nearest") for im in imgs]
stack = np.median(aligned, axis=0)
stack -= np.median(stack)
mjd = float(np.mean(times))
print("mean epoch:", Time(mjd, format="mjd").decimalyear)

# --- 3. detect stars
sm = ndimage.gaussian_filter(stack, 1.2)
noise = 1.4826 * np.median(np.abs(sm - np.median(sm)))
lab, n = ndimage.label(sm > 6 * noise)
cents = ndimage.center_of_mass(stack.clip(0), lab, range(1, n+1))
fluxes = ndimage.sum(stack.clip(0), lab, range(1, n+1))
sizes = ndimage.sum(np.ones_like(stack), lab, range(1, n+1))
det = [(c[1], c[0], fl) for c, fl, s in zip(cents, fluxes, sizes) if s >= 4]
det.sort(key=lambda t: -t[2])
det = np.array(det[:40])
print("detections:", len(det))

# --- 4. Gaia DR3 around the pointing, propagated to the NEOSSat epoch
ra0 = 15 * (17 + 57/60 + 48.0/3600); dec0 = 4 + 41/60 + 48.5/3600
q = ("SELECT ra, dec, pmra, pmdec, phot_g_mean_mag FROM gaiadr3.gaia_source "
     f"WHERE 1=CONTAINS(POINT('ICRS',ra,dec), CIRCLE('ICRS',{ra0},{dec0},0.25)) "
     "AND phot_g_mean_mag < 16.5")
url = "https://gea.esac.esa.int/tap-server/tap/sync?" + urllib.parse.urlencode(
    {"REQUEST": "doQuery", "LANG": "ADQL", "FORMAT": "csv", "QUERY": q})
rows = list(csv.DictReader(io.StringIO(requests.get(url, timeout=120).text)))
dt = Time(mjd, format="mjd").decimalyear - 2016.0
g = []
for r in rows:
    pmra = float(r["pmra"] or 0); pmdec = float(r["pmdec"] or 0)
    dec = float(r["dec"]) + pmdec * dt / 3.6e6
    ra = float(r["ra"]) + pmra * dt / 3.6e6 / np.cos(np.radians(dec))
    # leave Barnard's Star (and any other fast mover) out of the solution,
    # so its measured position is independent of Gaia
    if np.hypot(pmra, pmdec) > 1000:
        print("excluded fast star from WCS fit: G=%.2f pm=%.0f mas/yr" % (float(r["phot_g_mean_mag"]), np.hypot(pmra, pmdec)))
        continue
    g.append((ra, dec, float(r["phot_g_mean_mag"])))
g = np.array(sorted(g, key=lambda t: t[2]))
print("gaia stars:", len(g), "brightest G:", g[:3, 2])

# --- 5. brute-force rotation/parity/scale, offset by voting
gsky = SkyCoord(g[:, 0]*u.deg, g[:, 1]*u.deg)
cen = SkyCoord(ra0*u.deg, dec0*u.deg)
off = cen.spherical_offsets_to(gsky)
gxi = off[0].to_value(u.arcsec); geta = off[1].to_value(u.arcsec)  # east, north
best = None
for parity in (1, -1):
    for scale in np.arange(2.8, 3.3, 0.05):
        for ang in np.arange(0, 360, 1.0):
            a = np.radians(ang)
            # predicted pixel offsets of gaia stars (relative to pointing) for this model
            px = ( np.cos(a)*gxi*parity + np.sin(a)*geta) / scale
            py = (-np.sin(a)*gxi*parity + np.cos(a)*geta) / scale
            # vote for translation: detection - prediction
            dx = det[:15, 0][:, None] - px[None, :60]
            dy = det[:15, 1][:, None] - py[None, :60]
            H, xe, ye = np.histogram2d(dx.ravel(), dy.ravel(), bins=[np.arange(-400, 400, 3)]*2)
            k = H.max()
            if best is None or k > best[0]:
                i, j = np.unravel_index(np.argmax(H), H.shape)
                best = (k, parity, scale, ang, xe[i]+1.5, ye[j]+1.5)
print("best votes/parity/scale/angle/tx/ty:", best)

# --- 6. refine: match within 4 px, fit TAN WCS
k, parity, scale, ang, tx, ty = best
a = np.radians(ang)
px = ( np.cos(a)*gxi*parity + np.sin(a)*geta) / scale + tx
py = (-np.sin(a)*gxi*parity + np.cos(a)*geta) / scale + ty
for it in range(3):
    pairs = []
    for x, y, f in det:
        d2 = (px - x)**2 + (py - y)**2
        j = np.argmin(d2)
        if d2[j] < (4 if it == 0 else 2.5)**2:
            pairs.append((x, y, j))
    pairs = np.array(pairs)
    w = fit_wcs_from_points((pairs[:, 0], pairs[:, 1]), gsky[pairs[:, 2].astype(int)], projection="TAN")
    pp = w.world_to_pixel(gsky)
    px, py = pp[0], pp[1]
    res = np.hypot(px[pairs[:, 2].astype(int)] - pairs[:, 0], py[pairs[:, 2].astype(int)] - pairs[:, 1])
    print(f"iter {it}: matched {len(pairs)} stars, rms residual {np.sqrt(np.mean(res**2)):.2f} px")

scl = np.sqrt(abs(np.linalg.det(w.pixel_scale_matrix))) * 3600
print("fitted pixel scale: %.3f arcsec" % scl)
hdr = w.to_header()
hdr["MJD-OBS"] = mjd
hdr["NFRAMES"] = len(imgs)
hdr["COMMENT"] = "NEOSSat 2019-10-18 Barnard's Star median stack; WCS fitted to Gaia DR3 (propagated)"
fits.writeto(out + "/neossat_stack.fits", stack.astype("float32"), hdr, overwrite=True)
print("saved", out + "/neossat_stack.fits")

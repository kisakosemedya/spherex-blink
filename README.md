# SPHEREx Blink

A public web tool that plays NASA SPHEREx images of any patch of sky as a short
blink sequence, so anyone can spot objects that move or change brightness.

Built for the NASA Space Apps Challenge 2026, challenge
[Planet X and SPHEREx](https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/).

**Status:** the site runs locally and passes all five challenge test targets. It is not deployed yet.

## What it does

- Type an object name or coordinates; the SPHEREx visits of that spot play as a blink sequence.
- "Show what changed" subtracts the earliest solid visit from the latest: unchanged stars and noise go dark.
- Choose any of the six detector bands (0.75 to 5.0 µm) and the field of view.
- Known Gaia DR3 stars are circled and move with their proper motion; SPHEREx's own contamination flags can be overlaid.
- Every view has a shareable URL: `?ra=269.4462&dec=4.7688&det=2&fov=150`.
- The five test targets ship pre-downloaded in `data/presets/`, so they open instantly.

## Run it

```bash
python -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app:app --port 8000
```

Then open http://localhost:8000. A region that is not cached takes about a minute the first time.

## How it works

`backend/core/` finds every SPHEREx exposure covering a position (IRSA TAP), reads only the
needed pixels from the public AWS mirror with HTTP range requests, aligns them on a north-up
grid, groups them into visits and median-stacks each visit. `backend/routes/` and
`frontend/modules/` hold optional features; any file dropped there is picked up automatically.

Barnard's Star across three visits (detector 2). It moves about 10.6 arcseconds north in one year:

![Barnard's Star in three SPHEREx visits](proof/out/barnard_D2.png)

## Team

Working notes and per-role briefs (in Turkish) are in [`ekip/`](ekip/).
Start with `ekip/00_ORTAK_BAGLAM.md`.

## Data and acknowledgements

This project makes use of data products from the Spectro-Photometer for the
History of the Universe, Epoch of Reionization and Ices Explorer (SPHEREx),
which is a joint project of the Jet Propulsion Laboratory and the California
Institute of Technology, and is funded by the National Aeronautics and Space
Administration.

Data are served by the NASA/IPAC Infrared Science Archive (IRSA). AI assistance
(Claude) was used for code and documentation.

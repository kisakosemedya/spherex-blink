# Sky Revisit (SPHEREx Blink)

A public web tool that plays NASA SPHEREx images of any patch of sky as a short
blink sequence, so anyone can spot objects that move or change brightness.

The site is English first, with Turkish as a second language (`?lang=tr`). Pages:
home (`/`), sky map (`?view=map`), targets (`?view=targets`), one page per target
(`?view=target&id=barnard`), the observation workspace (`?view=observations&ra=…&dec=…`),
how it works (`?view=guide`) and data & credits (`?view=credits`). Add `&embed=1`
to an observations link for a player-only view. The interface uses a black stage
with Orbitron/Oxanium display type, Instrument Sans body text and IBM Plex Mono data.

Built for the NASA Space Apps Challenge 2026, challenge
[Planet X and SPHEREx](https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/).

The five challenge targets are bundled. New sky positions load from the IRSA archive.

**Live site:** https://skyrevisit.sothmac.com · **Presentation:** [docs/SkyRevisit_Global_Presentation.pdf](docs/SkyRevisit_Global_Presentation.pdf)

Team Sothmac: Muhammed Emirhan Bukan, Tuğçe Meydan, Ahmet Hant, Kerem Can, Ömer Kurt.

## What it does

- Type an object name or coordinates, or select an area on the Aladin Lite sky map. The map shows the SPHEREx DR1 all-sky mosaic, and the player shows dated spectral observations.
- Select two dates to subtract or average. The chosen dates and comparison mode can be shared in the view URL.
- Choose any of the six detector bands (0.75 to 5.0 µm) and the field of view.
- Known Gaia DR3 stars are circled and move with their proper motion; SPHEREx's own contamination flags can be overlaid.
- Every view has a shareable URL: `?ra=269.4462&dec=4.7688&det=2&fov=150`.
- The five test targets ship pre-downloaded in `data/presets/`, so they open instantly.
- New fields show a preview using up to six exposures per visit. Select **Stack more exposures** for a deeper stack.
- Barnard's Star includes a [CSA NEOSSat and Gaia DR3 comparison](showcase/neossat_barnard/). The player provides a relative brightness chart for RW Aurigae, R Draconis and points selected in the image.

## Run it

```bash
python -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app:app --port 8000
```

Then open http://localhost:8000. Initial load time for a new region depends on archive response times and the available exposures.

## How it works

`backend/core/` queries IRSA SIA2 for DR1 and QR3 observations, reads only the
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

Data are served by the NASA/IPAC Infrared Science Archive (IRSA).
See [DR1 products and citations](https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_dr1.html).
The sky map uses [CDS Aladin Lite](https://aladin.cds.unistra.fr/), and the comparison
uses [CSA NEOSSat data](https://data.asc-csa.gc.ca/dataset/neossat) and [ESA Gaia data](https://www.cosmos.esa.int/gaia).
AI assistants were used for code and documentation.

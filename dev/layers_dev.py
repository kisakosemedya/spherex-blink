"""Dev-only server for trying the Gaia and flags modules before the core site exists.

    uvicorn dev.layers_dev:app --port 8765     (run from the repository root)
    then open http://localhost:8765/dev/layers_demo.html

Not part of the product: the real server is backend/app.py (core).
"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from backend.routes import flags, gaia

ROOT = Path(__file__).resolve().parent.parent
app = FastAPI()
app.include_router(gaia.router)
app.include_router(flags.router)
app.mount("/", StaticFiles(directory=ROOT), name="static")

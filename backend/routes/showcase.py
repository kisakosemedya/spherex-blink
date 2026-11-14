"""Public assets for the Barnard archive comparison."""
from pathlib import Path
from typing import Literal

from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter()
OUT = Path(__file__).resolve().parents[2] / "showcase" / "neossat_barnard" / "out"


@router.get("/showcase/barnard/{asset}")
def barnard(asset: Literal["summary.json", "comparison.png", "blink.gif"]):
    extension = asset.rsplit(".", 1)[1]
    return FileResponse(OUT / f"barnard_neossat_spherex.{extension}")

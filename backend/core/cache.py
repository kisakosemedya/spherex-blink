"""Tiny JSON cache. `data/presets/` ships with the site (the five test
targets, so the demo never depends on the archive); `cache/` fills at runtime."""
import json
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PRESET_DIR = ROOT / "data" / "presets"
CACHE_DIR = ROOT / "cache"
_locks = {}
_guard = threading.Lock()


def load(key):
    for d in (PRESET_DIR, CACHE_DIR):
        p = d / f"{key}.json"
        if p.exists():
            return json.loads(p.read_text())
    return None


def save(key, obj, preset=False):
    d = PRESET_DIR if preset else CACHE_DIR
    d.mkdir(parents=True, exist_ok=True)
    tmp = d / f"{key}.json.tmp"
    tmp.write_text(json.dumps(obj))
    tmp.replace(d / f"{key}.json")


def lock(key):
    """One lock per key, so two visitors asking for the same new field
    trigger a single download."""
    with _guard:
        return _locks.setdefault(key, threading.Lock())

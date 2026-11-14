"""Pre-download the five test targets into data/presets/ so the demo opens
instantly and never depends on the archive.

    python -m tools.prebuild              default detector of each target
    python -m tools.prebuild --all        all six detectors (slow)
    python -m tools.prebuild --flags      also the suspect-pixel masks
"""
import shutil
import sys
import time

from backend.core import cache
from backend.core.frames import build_frames, frames_key
from backend.core.targets import TARGETS


def keep(key):
    src = cache.CACHE_DIR / f"{key}.json"
    if src.exists():
        cache.PRESET_DIR.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(cache.PRESET_DIR / f"{key}.json"))


def main():
    every = "--all" in sys.argv
    flags = "--flags" in sys.argv
    for tg in TARGETS:
        for det in (range(1, 7) if every else [tg["det"]]):
            t0 = time.time()
            try:
                out = build_frames(tg["ra"], tg["dec"], det, float(tg["fov"]))
                keep(frames_key(tg["ra"], tg["dec"], det, float(tg["fov"])))
                print(f"{tg['id']} D{det}: {len(out['visits'])} visits, "
                      f"{sum(v['n_images'] for v in out['visits'])} exposures, {time.time() - t0:.0f}s", flush=True)
            except Exception as e:
                print(f"{tg['id']} D{det}: FAILED {e!r}", flush=True)
            if flags and det == tg["det"]:
                from backend.routes.flags import flags_overlay
                try:
                    flags_overlay(tg["ra"], tg["dec"], det, float(tg["fov"]))
                    keep(f"flags_{tg['ra']:.4f}_{tg['dec']:.4f}_D{det}_{float(tg['fov']):.0f}")
                    print(f"{tg['id']} D{det}: flags ok", flush=True)
                except Exception as e:
                    print(f"{tg['id']} D{det}: flags FAILED {e!r}", flush=True)


if __name__ == "__main__":
    main()

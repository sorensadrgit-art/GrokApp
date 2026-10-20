#!/usr/bin/env python3
"""Keep the legacy Codex overlay aligned with the portable manifest."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1] / "plugins" / "cuebook"
    portable = json.loads((root / "plugin.json").read_text(encoding="utf-8"))
    overlay = {
        key: value for key, value in portable.items()
        if key not in {"$schema", "extensions"}
    }
    overlay["skills"] = "./skills"
    overlay["interface"] = portable["extensions"]["com.openai"]["interface"]
    expected = json.dumps(overlay, ensure_ascii=False, indent=2) + "\n"
    target = root / ".codex-plugin" / "plugin.json"
    current = target.read_text(encoding="utf-8") if target.exists() else None
    if args.check:
        if current != expected:
            print("Codex compatibility manifest is stale. Run npm run plugin:sync.")
            return 1
        print("Portable and Codex compatibility manifests match.")
        return 0
    if current != expected:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(expected, encoding="utf-8")
    print("Codex compatibility manifest synchronized.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

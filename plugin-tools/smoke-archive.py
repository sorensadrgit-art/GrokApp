#!/usr/bin/env python3
"""Verify a fresh Cuebook archive and its real standalone Python entry points."""
from __future__ import annotations

import argparse
import hashlib
import json
import stat
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path, PurePosixPath


def run_json(command: list[str], cwd: Path) -> dict:
    result = subprocess.run(command, cwd=cwd, capture_output=True, text=True, timeout=30)
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip() or "Verification command failed")
    return json.loads(result.stdout)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    args = parser.parse_args()
    archive = args.archive.resolve()
    validator = Path(__file__).resolve().parent / "package" / "package_plugin.py"
    with tempfile.TemporaryDirectory(prefix="cuebook-install-") as temporary:
        root = Path(temporary)
        with zipfile.ZipFile(archive) as bundle:
            members = bundle.infolist()
            if len(members) > 1000 or sum(item.file_size for item in members) > 25 * 1024 * 1024:
                raise ValueError("Unexpected archive size")
            seen = set()
            for item in members:
                name = item.filename
                path = PurePosixPath(name)
                if (not name or name in seen or path.is_absolute() or ".." in path.parts
                        or "\\" in name or ":" in name or any(ord(c) < 32 for c in name)
                        or stat.S_ISLNK(item.external_attr >> 16)):
                    raise ValueError("Unsafe or duplicate archive member")
                seen.add(name)
            if bundle.testzip() is not None:
                raise ValueError("Corrupt archive member")
            bundle.extractall(root)

        validation = subprocess.run(
            [sys.executable, "-B", str(validator), "validate", str(root)],
            capture_output=True, text=True, timeout=30,
        )
        if validation.returncode:
            raise RuntimeError(validation.stderr.strip() or validation.stdout.strip())

        agent = root / "skills" / "cuebook-agent-brief" / "scripts" / "catalog.py"
        creative = root / "skills" / "cuebook-creative-codes" / "scripts" / "catalog.py"
        executable = [sys.executable, "-B"]
        agent_record = run_json([*executable, str(agent), "agent", "get", "/debug", "--json"], root)
        code_record = run_json([*executable, str(creative), "codes", "get", "/debug", "--json"], root)
        if agent_record["entry"]["meaning"] == code_record["entry"]["meaning"]:
            raise ValueError("Catalog namespace distinction was lost")

        task = "Fix the empty-state bug while preserving navigation."
        brief = run_json([*executable, str(agent), "agent", "brief", "--preset", "fix", "--task", task, "--json"], root)
        if [entry["id"] for entry in brief["entries"]] != ["debug", "repro", "fix", "tests", "verify"]:
            raise ValueError("Preset order was changed")
        if brief["task"] != task or brief["draft"] is not True or brief["executes_actions"] is not False:
            raise ValueError("Brief lost its task or draft boundary")

        stack = run_json([*executable, str(creative), "codes", "stack", "--ids", "packshot", "luxuryedition", "--subject", "The user's watch", "--json"], root)
        if [entry["id"] for entry in stack["entries"]] != ["s001", "s002"]:
            raise ValueError("Creative aliases did not resolve")
        if stack["draft"] is not True or stack["executes_actions"] is not False:
            raise ValueError("Creative stack lost its draft boundary")

        agent_stats = run_json([*executable, str(agent), "agent", "stats", "--json"], root)
        code_stats = run_json([*executable, str(creative), "codes", "stats", "--json"], root)
        print(json.dumps({
            "ok": True,
            "fresh_extraction": True,
            "agent_commands": agent_stats["total"],
            "creative_codes": code_stats["total"],
            "checks": ["package validation", "separate debug meanings", "ordered bug-fix preset", "creative alias stack"],
            "archive_sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
        }, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, KeyError, RuntimeError, zipfile.BadZipFile, subprocess.TimeoutExpired) as error:
        print(f"Cuebook archive verification failed: {error}", file=sys.stderr)
        raise SystemExit(1)

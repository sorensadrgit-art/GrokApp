"""Behavioral integrity tests for the private Cuebook package boundary."""
from __future__ import annotations

import copy
import importlib.util
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
import unittest
import zipfile

sys.dont_write_bytecode = True
SCRIPT = Path(__file__).with_name("package_plugin.py")
spec = importlib.util.spec_from_file_location("cuebook_package", SCRIPT)
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)


class PackageBoundaryTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix="cuebook-package-test-")
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.root = self.base / "cuebook"
        self.interface = {
            "displayName": "Cuebook", "shortDescription": "Agent command briefs",
            "longDescription": "Create useful agent briefs from the included catalog.",
            "developerName": "Soren", "category": "Productivity",
            "capabilities": ["Interactive"],
            "defaultPrompt": ["Create an agent brief."],
            "logo": "./assets/logo.svg", "composerIcon": "./assets/logo.svg",
        }
        self.manifest = {
            "$schema": package.SCHEMA, "name": "cuebook", "version": "0.1.0",
            "description": "A command brief workflow.", "author": {"name": "Soren"},
            "extensions": {"com.openai": {"interface": self.interface}},
        }
        self.write_manifests()
        self.write("assets/logo.svg", '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path fill="#123456" d="M8 8H56V56H8Z"/></svg>')
        self.write("skills/brief/SKILL.md", "---\nname: brief\ndescription: Create a brief from a request.\n---\n\nRead the [guide](references/guide.md) and create the brief.\n")
        self.write("skills/brief/references/guide.md", "# Guide\n\nKeep the requested outcome and verification visible.\n")
        self.write("skills/brief/agents/openai.yaml", 'interface:\n  display_name: "Brief"\n  short_description: "Create an agent brief"\n  default_prompt: "Create a brief."\npolicy:\n  products:\n    - CHAT\n    - CODEX\n  allow_implicit_invocation: true\n')

    def write(self, relative: str, text: str) -> Path:
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        return path

    def write_manifests(self) -> None:
        legacy = copy.deepcopy({key: value for key, value in self.manifest.items() if key not in {"$schema", "extensions"}})
        legacy["skills"] = "./skills/"
        legacy["interface"] = copy.deepcopy(self.interface)
        self.write("plugin.json", json.dumps(self.manifest))
        self.write(".codex-plugin/plugin.json", json.dumps(legacy))

    def assert_rejected(self, message: str) -> None:
        with self.assertRaisesRegex(package.PackageError, message):
            package.validate_package(self.root)

    def test_private_package_needs_no_public_legal_urls(self) -> None:
        result = package.validate_package(self.root)
        self.assertEqual(result["skills"], ["brief"])
        self.assertEqual(result["architecture"], "skills-only")
        self.assertTrue(result["ok"])

    def test_plain_yaml_description_can_include_apostrophes(self) -> None:
        self.write("skills/brief/SKILL.md", "---\nname: brief\ndescription: Use the user's project notes to create a brief.\n---\n\nKeep the user's intent.\n")
        self.assertTrue(package.validate_package(self.root)["ok"])

    def test_manifest_traversal_cannot_use_existing_external_asset(self) -> None:
        (self.base / "outside.svg").write_text('<svg width="64" height="64"/>')
        self.interface["logo"] = "../outside.svg"
        self.write_manifests()
        self.assert_rejected("contained")

    def test_markdown_reference_cannot_escape_or_be_missing(self) -> None:
        self.write("skills/brief/references/guide.md", "[External local file](../../../../outside.txt)\n")
        (self.base / "outside.txt").write_text("private")
        self.assert_rejected("escapes package")
        self.write("skills/brief/references/guide.md", "[Missing](missing.md)\n")
        self.assert_rejected("missing referenced resource")

    def test_existing_cross_skill_reference_is_self_contained(self) -> None:
        self.write("skills/other/SKILL.md", "---\nname: other\ndescription: Another focused workflow.\n---\n\nRead [brief](../brief/SKILL.md).\n")
        self.assertEqual(package.validate_package(self.root)["skills"], ["brief", "other"])

    def test_symlink_file_and_directory_are_rejected(self) -> None:
        for is_directory in (False, True):
            with self.subTest(directory=is_directory):
                outside = self.base / ("outside-dir" if is_directory else "outside.txt")
                outside.mkdir() if is_directory else outside.write_text("sensitive")
                link = self.root / "assets" / ("linked-dir" if is_directory else "linked.txt")
                try:
                    link.symlink_to(outside, target_is_directory=is_directory)
                except (NotImplementedError, OSError):
                    self.skipTest("symlinks are unavailable on this host")
                self.assert_rejected("symlink")
                link.unlink()

    def test_contamination_is_rejected_instead_of_silently_packaged(self) -> None:
        for path in ("src/app.ts", "plugin-tools/tool.py", "assets/.env", "assets/private.pem", "skills/brief/node_modules/library.js", "skills/brief/cache.pyc", "assets/previous.zip"):
            with self.subTest(path=path):
                contaminated = self.write(path, "unexpected")
                self.assert_rejected("contamination|unexpected top-level|secret-shaped")
                contaminated.unlink()
                # Remove only the empty directories created for this test case.
                parent = contaminated.parent
                while parent != self.root and not any(parent.iterdir()):
                    parent.rmdir()
                    parent = parent.parent

    def test_missing_asset_and_metadata_drift_are_rejected(self) -> None:
        (self.root / "assets/logo.svg").unlink()
        self.assert_rejected("missing referenced resource")
        self.write("assets/logo.svg", '<svg width="64" height="64"/>')
        self.manifest["version"] = "0.2.0"
        self.write("plugin.json", json.dumps(self.manifest))
        self.assert_rejected("not synchronized: version")
        self.write_manifests()
        legacy = json.loads((self.root / ".codex-plugin/plugin.json").read_text())
        legacy["interface"]["displayName"] = "Something Else"
        self.write(".codex-plugin/plugin.json", json.dumps(legacy))
        self.assert_rejected("interface metadata are not synchronized")

    def test_active_external_and_nonsquare_svg_are_rejected(self) -> None:
        bodies = (
            '<svg width="64" height="32"/>',
            '<svg width="64" height="64"><script>alert(1)</script></svg>',
            '<svg width="64" height="64"><foreignObject/></svg>',
            '<svg width="64" height="64"><image href="https://example.com/image.png"/></svg>',
            '<svg width="64" height="64" onload="alert(1)"/>',
            '<!DOCTYPE svg [<!ENTITY x "bad">]><svg width="64" height="64">&x;</svg>',
            '<svg width="64" height="64"><path fill="url(https://example.com/paint.svg)"/></svg>',
            '<?xml-stylesheet href="https://example.com/paint.css"?><svg width="64" height="64"/>',
        )
        for body in bodies:
            with self.subTest(body=body):
                self.write("assets/logo.svg", body)
                self.assert_rejected("SVG")

    def test_internal_svg_gradient_is_accepted(self) -> None:
        self.write("assets/logo.svg", '<svg width="64" height="64"><defs><linearGradient id="g"><stop offset="0" stop-color="#123456"/></linearGradient></defs><path fill="url(#g)" d="M1 1H63V63H1Z"/></svg>')
        self.assertTrue(package.validate_package(self.root)["ok"])

    def test_yaml_wrong_types_duplicates_and_aliases_fail_closed(self) -> None:
        prefix = 'interface:\n  display_name: "Brief"\n  short_description: "Create a brief"\n'
        for suffix in ('policy:\n  allow_implicit_invocation: "false"\n', 'policy:\n  products: CHAT\n', 'policy:\n  allow_implicit_invocation: true\n  allow_implicit_invocation: false\n', 'policy: &policy\n  allow_implicit_invocation: true\n'):
            with self.subTest(suffix=suffix):
                self.write("skills/brief/agents/openai.yaml", prefix + suffix)
                self.assert_rejected("boolean|supported string list|duplicate YAML|anchors")

    def test_skill_frontmatter_requires_string_fields_and_usable_body(self) -> None:
        for source in ("---\nname: false\ndescription: A workflow.\n---\n\nInstructions.", "---\nname: brief\nname: other\ndescription: A workflow.\n---\n\nInstructions.", "---\nname: brief\ndescription: A workflow.\n---\n"):
            with self.subTest(source=source):
                self.write("skills/brief/SKILL.md", source)
                self.assert_rejected("nonblank string|duplicate YAML|body must not be empty")

    def test_duplicate_json_and_schema_errors_are_not_normalized_away(self) -> None:
        self.write("plugin.json", '{"name":"cuebook","name":"other"}')
        self.assert_rejected("duplicate JSON key")
        self.manifest["$schema"] = "https://example.com/not-plugin.json"
        self.write_manifests()
        self.assert_rejected("supported Agent Plugins")

    def test_empty_skill_and_manifest_subdirectory_are_rejected(self) -> None:
        (self.root / "skills/empty").mkdir()
        self.assert_rejected("containing SKILL.md")
        (self.root / "skills/empty").rmdir()
        (self.root / ".codex-plugin/extra").mkdir()
        self.assert_rejected("only plugin.json")

    def test_bad_compatibility_component_type_is_a_controlled_failure(self) -> None:
        legacy = json.loads((self.root / ".codex-plugin/plugin.json").read_text())
        legacy["skills"] = {"path": "./skills"}
        self.write(".codex-plugin/plugin.json", json.dumps(legacy))
        self.assert_rejected("must declare ./skills/")

    def test_build_is_byte_deterministic_and_extracted_package_validates(self) -> None:
        first = self.base / "first.zip"
        second = self.base / "second.zip"
        first_report = package.build_package(self.root, first)
        for path in self.root.rglob("*"):
            if path.is_file():
                os.utime(path, (1_700_000_000, 1_700_000_000))
                path.chmod(0o755)
        second_report = package.build_package(self.root, second)
        self.assertEqual(first.read_bytes(), second.read_bytes())
        self.assertEqual(first_report["sha256"], second_report["sha256"])
        with zipfile.ZipFile(first) as archive:
            self.assertEqual(archive.namelist(), sorted(archive.namelist()))
            for member in archive.infolist():
                self.assertEqual(member.date_time, (1980, 1, 1, 0, 0, 0))
                self.assertEqual(stat.S_IMODE(member.external_attr >> 16), 0o644)
            extracted = self.base / "extracted"
            archive.extractall(extracted)
        self.assertEqual(package.validate_package(extracted)["inventorySha256"], first_report["inventorySha256"])

    def test_output_inside_package_is_rejected_before_writing(self) -> None:
        with self.assertRaisesRegex(package.PackageError, "outside the plugin root"):
            package.build_package(self.root, self.root / "assets/archive.zip")
        self.assertFalse((self.root / "assets/archive.zip").exists())

    def test_invalid_package_cli_returns_failure_and_no_archive(self) -> None:
        self.write("assets/.env", "SECRET=do-not-package")
        output = self.base / "should-not-exist.zip"
        result = subprocess.run([sys.executable, "-B", str(SCRIPT), "build", str(self.root), str(output), "--json"], capture_output=True, text=True, check=False)
        self.assertEqual(result.returncode, 1)
        self.assertFalse(json.loads(result.stdout)["ok"])
        self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main()

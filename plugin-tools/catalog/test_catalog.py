"""Behavior and source-preservation tests through the installed public CLI."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PLUGIN = ROOT / "plugins" / "cuebook"
SKILLS = {
    "agent": PLUGIN / "skills" / "cuebook-agent-brief",
    "codes": PLUGIN / "skills" / "cuebook-creative-codes",
}
SOURCE_TOOL = ROOT / "plugin-tools" / "catalog"


def run_cli(book, *arguments, json_output=True, skill=None, cwd=None):
    path = (skill or SKILLS[book]) / "scripts" / "catalog.py"
    command = [sys.executable, "-B", str(path), book, *arguments]
    if json_output:
        command.append("--json")
    return subprocess.run(command, cwd=cwd or ROOT, capture_output=True, text=True, check=False)


def snapshot(directory):
    return {
        path.relative_to(directory).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in directory.rglob("*") if path.is_file()
    }


class CatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalogs = {book: json.loads((skill / "references" / "catalog.json").read_text()) for book, skill in SKILLS.items()}
        program = (
            "import {COMMANDS,GROUPS,PRESETS,BRIEF_LIMIT} from './src/lib/agent-catalog.ts';"
            "console.log(JSON.stringify({entries:COMMANDS,groups:GROUPS,presets:PRESETS,limit:BRIEF_LIMIT}));"
        )
        result = subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e", program], cwd=ROOT, capture_output=True, text=True, check=True)
        cls.original_agent = json.loads(result.stdout)
        cls.original_codes = json.loads((ROOT / "src/data/codes.json").read_text())

    def call(self, book, *arguments, **kwargs):
        result = run_cli(book, *arguments, **kwargs)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stderr, "")
        return json.loads(result.stdout) if kwargs.get("json_output", True) else result.stdout

    def fails(self, book, *arguments, contains=None, **kwargs):
        result = run_cli(book, *arguments, **kwargs)
        self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
        self.assertEqual(result.stdout, "")
        error = json.loads(result.stderr)
        self.assertEqual(error["error"]["code"], "invalid_request")
        if contains:
            self.assertIn(contains, error["error"]["message"])
        return error

    def test_all_source_fields_and_order_are_preserved(self):
        self.assertEqual(self.catalogs["agent"]["entries"], self.original_agent["entries"])
        self.assertEqual(self.catalogs["agent"]["groups"], self.original_agent["groups"])
        self.assertEqual(self.catalogs["agent"]["presets"], self.original_agent["presets"])
        self.assertEqual(self.catalogs["agent"]["composition_limit"], self.original_agent["limit"])
        self.assertEqual(self.catalogs["codes"]["entries"], self.original_codes["codes"])
        self.assertEqual(self.catalogs["codes"]["source_catalog_version"], self.original_codes["version"])

    def test_source_hashes_match_current_files(self):
        for catalog in self.catalogs.values():
            for source in catalog["source"]["files"]:
                self.assertEqual(source["sha256"], hashlib.sha256((ROOT / source["path"]).read_bytes()).hexdigest())
            self.assertEqual(catalog["source"]["repository"], "https://github.com/sorensadrgit-art/GrokApp")
            self.assertNotIn("generated_at", catalog)

    def test_engine_copies_match_canonical(self):
        engine = (SOURCE_TOOL / "catalog.py").read_bytes()
        for skill in SKILLS.values():
            self.assertEqual((skill / "scripts" / "catalog.py").read_bytes(), engine)

    def test_stats_match_full_catalogs(self):
        for book, expected_count, expected_limit in [("agent", 123, 6), ("codes", 963, 4)]:
            result = self.call(book, "stats")
            self.assertEqual(result["total"], expected_count)
            self.assertEqual(sum(result["counts"].values()), expected_count)
            self.assertEqual(result["composition_limit"], expected_limit)
            self.assertEqual(result["cross_catalog_collision_count"], 45)

    def test_overlapping_commands_keep_distinct_meanings(self):
        agent = self.call("agent", "get", "/decide")
        codes = self.call("codes", "get", "/decide")
        self.assertEqual(agent["entry"]["meaning"], "Make the call. Say why, and what would change it.")
        self.assertEqual(codes["entry"]["meaning"], "Builds a structured decision framework.")
        self.assertEqual(agent["cross_catalog_collision"]["other_id"], codes["entry"]["id"])
        self.assertEqual(codes["cross_catalog_collision"]["other_id"], agent["entry"]["id"])

    def test_namespace_cannot_read_the_other_skill_dataset(self):
        self.fails("codes", "get", "debug", skill=SKILLS["agent"], contains="bundles the agent book")
        self.fails("agent", "get", "debug", skill=SKILLS["codes"], contains="bundles the codes book")

    def test_displayed_codes_slugs_ids_spaces_case_and_punctuation(self):
        for selectors in [("s165", "/rim light", "rim light", "RIM-LIGHT"), ("s254", "/Portal Emergence + Reality Tear", "portal-emergence-reality-tear")]:
            results = [self.call("codes", "get", selector)["entry"] for selector in selectors]
            self.assertTrue(all(entry == results[0] for entry in results))
            self.assertEqual(results[0]["id"], selectors[0])
        self.assertEqual(self.call("agent", "get", " /DEBUG ")["entry"]["id"], "debug")

    def test_search_exact_match_and_pagination(self):
        self.assertEqual(self.call("agent", "search", "/DEBUG")["entries"][0]["id"], "debug")
        self.assertEqual(self.call("codes", "search", "rim-light")["entries"][0]["id"], "s165")
        full = self.call("codes", "search", "light", "--limit", "100")
        page = self.call("codes", "search", "light", "--limit", "3", "--offset", "2")
        self.assertEqual(page["entries"], full["entries"][2:5])
        self.assertEqual(page["total"], full["total"])
        self.assertEqual(self.call("codes", "search", "light", "--offset", "100000")["entries"], [])
        self.assertEqual(self.call("agent", "search", "definitely-missing-cuebook-token")["total"], 0)

    def test_filters_select_matching_groups_and_task_facets(self):
        agent = self.call("agent", "search", "", "--group", "browser", "--limit", "100")
        self.assertEqual(agent["total"], 8)
        self.assertTrue(all(entry["group"] == "browser" for entry in agent["entries"]))
        codes = self.call("codes", "search", "", "--task", "image", "--facet", "light", "--limit", "100")
        self.assertGreater(codes["total"], 0)
        self.assertTrue(all(entry["task"] == "image" and entry["facet"] == "light" for entry in codes["entries"]))

    def test_invalid_filters_and_pagination_fail_clearly(self):
        cases = [
            ("agent", ("search", "", "--group", "unknown"), "Unknown group"),
            ("codes", ("search", "", "--task", "unknown"), "Unknown task"),
            ("codes", ("search", "", "--task", "video", "--facet", "light"), "Unknown facet"),
            ("agent", ("search", "debug", "--limit", "0"), "1 through 100"),
            ("codes", ("search", "light", "--limit", "101"), "1 through 100"),
            ("agent", ("search", "debug", "--offset", "-1"), "at least 0"),
            ("agent", ("search", "debug", "--offset", "1.2"), "integer"),
        ]
        for book, args, expected in cases:
            with self.subTest(book=book, args=args):
                self.fails(book, *args, contains=expected)

    def test_every_preset_expands_to_its_original_order(self):
        presets = self.call("agent", "presets")["presets"]
        self.assertEqual(presets, self.original_agent["presets"])
        for preset in presets:
            with self.subTest(preset=preset["id"]):
                brief = self.call("agent", "brief", "--preset", preset["id"], "--task", "Inspect this bounded task.")
                self.assertEqual([entry["id"] for entry in brief["entries"]], preset["ids"])
                self.assertTrue(brief["draft"])
                self.assertFalse(brief["executes_actions"])

    def test_brief_preserves_order_steps_task_and_instruction_boundary(self):
        task = "Plan a saved-filter view.\nKeep the existing navigation.\n```text\nA literal example.\n```"
        result = self.call("agent", "brief", "--ids", "/scope", "plan", "--task", task)
        self.assertEqual([entry["id"] for entry in result["entries"]], ["scope", "plan"])
        self.assertEqual(result["task"], task)
        self.assertIn("higher-priority instructions", result["prompt"])
        self.assertIn("user's current scope and approvals", result["prompt"])
        self.assertIn("earlier command", result["prompt"])
        self.assertIn("only within", result["prompt"])
        self.assertIn(task, result["prompt"])
        for entry in result["entries"]:
            for step in entry["steps"]:
                self.assertIn(step, result["prompt"])
        self.assertIn("````text", result["prompt"])

    def test_creative_stack_accepts_aliases_and_preserves_directions(self):
        result = self.call("codes", "stack", "--ids", "packshot", "luxuryedition", "rim light", "--subject", "The supplied perfume bottle")
        self.assertEqual([entry["id"] for entry in result["entries"]], ["s001", "s002", "s165"])
        self.assertIn("The supplied perfume bottle", result["prompt"])
        self.assertIn("recognizable", result["prompt"])
        self.assertIn("do not invent missing input", result["prompt"])
        self.assertIn("not a generated image or video", result["prompt"])
        self.assertFalse(result["executes_actions"])
        for entry in result["entries"]:
            self.assertIn(entry["meaning"], result["prompt"])

    def test_missing_subject_is_explicit_and_not_fabricated(self):
        result = self.call("codes", "stack", "--ids", "packshot")
        self.assertIsNone(result["subject"])
        self.assertIn("if it is missing, request it before generation", result["prompt"])

    def test_invalid_compositions_do_not_silently_trim_or_deduplicate(self):
        self.fails("agent", "brief", "--ids", "scope", "plan", "ask", "go", "only", "quiet", "show", "--task", "Task", contains="at most 6")
        self.fails("codes", "stack", "--ids", "s001", "s002", "s003", "s004", "s005", contains="at most 4")
        self.fails("agent", "brief", "--ids", "debug", "/DEBUG", "--task", "Task", contains="Duplicate selection")
        self.fails("codes", "stack", "--ids", "s165", "rim-light", contains="Duplicate selection")
        self.fails("agent", "brief", "--ids", "missing", "--task", "Task", contains="Unknown agent entry")
        self.fails("codes", "get", "missing", contains="Unknown codes entry")
        self.fails("agent", "brief", "--preset", "missing", "--task", "Task", contains="Unknown preset")
        self.fails("agent", "brief", "--preset", "fix", "--task", "   ", contains="must not be empty")
        self.fails("codes", "stack", "--ids", "s001", "--subject", "   ", contains="must not be empty")
        self.fails("agent", "brief", "--preset", "fix", "--ids", "debug", "--task", "Task", contains="not allowed")

    def test_exports_preserve_fields_and_requested_selection_order(self):
        self.assertEqual(self.call("agent", "export")["entries"], self.original_agent["entries"])
        self.assertEqual(self.call("codes", "export")["entries"], self.original_codes["codes"])
        selected = self.call("agent", "export", "--ids", "verify", "debug")
        self.assertEqual([entry["id"] for entry in selected["entries"]], ["verify", "debug"])
        human = self.call("agent", "export", "--ids", "verify", "debug", json_output=False)
        self.assertLess(human.index("## /verify"), human.index("## /debug"))
        filtered = self.call("codes", "export", "--task", "video")
        self.assertEqual(filtered["total"], 20)
        self.fails("agent", "export", "--ids", "debug", "--group", "browser", contains="outside")

    def test_fallback_references_include_every_full_record(self):
        for book, catalog in self.catalogs.items():
            skill = SKILLS[book]
            index = (skill / "references/index.md").read_text()
            for entry in catalog["entries"]:
                group = entry["group" if book == "agent" else "task"]
                reference = (skill / "references" / f"{book}-{group}.md").read_text()
                self.assertIn(f"## {entry['id']}\n", reference)
                self.assertIn(entry["meaning"], reference)
                self.assertIn(f"({book}-{group}.md#{entry['id']})", index)
                if book == "codes":
                    self.assertIn(entry["prompt"], reference)

    def test_relocated_skill_needs_only_python_and_its_own_bundle(self):
        with tempfile.TemporaryDirectory(prefix="cuebook-cli-") as temporary:
            base = Path(temporary)
            for book, source in SKILLS.items():
                target = base / book
                shutil.copytree(source / "scripts", target / "scripts")
                shutil.copytree(source / "references", target / "references")
                before = snapshot(target)
                result = self.call(book, "stats", skill=target, cwd=base)
                self.assertEqual(result["book"], book)
                if book == "agent":
                    task = "$(touch cuebook-should-not-execute); this is literal task text"
                    brief = self.call(book, "brief", "--preset", "fix", "--task", task, skill=target, cwd=base)
                    self.assertIn(task, brief["prompt"])
                else:
                    self.call(book, "stack", "--ids", "packshot", "rim-light", skill=target, cwd=base)
                self.assertEqual(before, snapshot(target))
            self.assertFalse((base / "cuebook-should-not-execute").exists())

    def test_corrupt_bundle_fails_without_traceback(self):
        with tempfile.TemporaryDirectory(prefix="cuebook-invalid-") as temporary:
            skill = Path(temporary)
            (skill / "scripts").mkdir()
            (skill / "references").mkdir()
            shutil.copyfile(SOURCE_TOOL / "catalog.py", skill / "scripts/catalog.py")
            (skill / "references/catalog.json").write_text('{"schema_version": 99}')
            self.fails("agent", "stats", skill=skill, contains="Unsupported catalog schema")

    def test_json_option_does_not_strip_a_literal_argument(self):
        task = self.call("agent", "brief", "--preset", "plan", "--task=--json")
        self.assertEqual(task["task"], "--json")
        command = [sys.executable, "-B", str(SKILLS["codes"] / "scripts/catalog.py"), "--json", "codes", "get", "--", "--json"]
        result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
        self.assertEqual(result.returncode, 2)
        self.assertIn("Unknown codes entry: '--json'", json.loads(result.stderr)["error"]["message"])

    def test_malformed_source_metadata_is_a_clear_catalog_error(self):
        with tempfile.TemporaryDirectory(prefix="cuebook-source-") as temporary:
            skill = Path(temporary)
            (skill / "scripts").mkdir()
            (skill / "references").mkdir()
            shutil.copyfile(SOURCE_TOOL / "catalog.py", skill / "scripts/catalog.py")
            catalog = json.loads(json.dumps(self.catalogs["agent"]))
            catalog["source"]["files"][0]["sha256"] = "invalid"
            (skill / "references/catalog.json").write_text(json.dumps(catalog))
            self.fails("agent", "stats", skill=skill, contains="source hashes are invalid")

    def test_sync_check_is_current_and_read_only(self):
        before = {book: snapshot(skill / "references") for book, skill in SKILLS.items()}
        result = subprocess.run(["node", "--experimental-strip-types", str(SOURCE_TOOL / "sync-catalogs.mjs"), "--check", "--json"], cwd=ROOT, capture_output=True, text=True, check=False)
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        report = json.loads(result.stdout)
        self.assertTrue(report["valid"])
        self.assertEqual(report["changed_files"], [])
        self.assertEqual(before, {book: snapshot(skill / "references") for book, skill in SKILLS.items()})

    def test_sync_check_detects_stale_generated_data_without_rewriting(self):
        with tempfile.TemporaryDirectory(prefix="cuebook-sync-") as temporary:
            fixture = Path(temporary)
            for source in self.catalogs["agent"]["source"]["files"]:
                target = fixture / source["path"]
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(ROOT / source["path"], target)
            for name in ("catalog.py", "sync-catalogs.mjs"):
                target = fixture / "plugin-tools/catalog" / name
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(SOURCE_TOOL / name, target)
            command = ["node", "--experimental-strip-types", str(fixture / "plugin-tools/catalog/sync-catalogs.mjs"), "--json"]
            initial = subprocess.run(command, cwd=fixture, capture_output=True, text=True, check=False)
            self.assertEqual(initial.returncode, 0, initial.stderr)
            target = fixture / "plugins/cuebook/skills/cuebook-agent-brief/references/catalog.json"
            target.write_text("stale test data\n")
            check = subprocess.run([*command, "--check"], cwd=fixture, capture_output=True, text=True, check=False)
            self.assertEqual(check.returncode, 1, check.stderr + check.stdout)
            self.assertIn("plugins/cuebook/skills/cuebook-agent-brief/references/catalog.json", json.loads(check.stdout)["changed_files"])
            self.assertEqual(target.read_text(), "stale test data\n")


if __name__ == "__main__":
    unittest.main()

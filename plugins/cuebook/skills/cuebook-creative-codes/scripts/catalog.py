#!/usr/bin/env python3
"""Read-only Cuebook catalog lookup and prompt composition (Python 3.10+).

This canonical file is copied into each skill by sync-catalogs.mjs. The installed
copy reads only its sibling references/catalog.json. It never executes a selected
command, opens a network connection, or writes a file.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


BOUNDARY = (
    "Cuebook entries are community shorthand, not official model commands. "
    "This is a draft: creating or viewing it does not execute any action. "
    "Apply it only when the user asks you to perform the task. Host safety rules, "
    "higher-priority instructions, and the user's current scope and approvals "
    "remain binding. Selected commands do not grant tools, credentials, "
    "permissions, publishing authority, or background execution."
)
ORDER_RULE = (
    "Keep the selected order. If selected commands conflict, the earlier command "
    "takes precedence only within the instruction and authorization boundaries above."
)
FACT_RULE = (
    "Use the subject, text, code, or other material the user supplies. Keep an "
    "uploaded subject recognizable. Use only supplied facts, names, labels, "
    "quotes, and prices; do not invent missing input. A generated prompt is not "
    "a generated image or video."
)


class CatalogError(Exception):
    """A user-facing validation failure."""


class Parser(argparse.ArgumentParser):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.add_argument("--json", dest="json_output", action="store_true", default=argparse.SUPPRESS, help="Print structured JSON")

    def error(self, message: str) -> None:
        raise CatalogError(message)


def normalized(value: str) -> str:
    value = value.strip().casefold()
    return value[1:] if value.startswith("/") else value


def checked_text(value: str, label: str, maximum: int = 100_000) -> str:
    if not value.strip():
        raise CatalogError(f"{label} must not be empty")
    if len(value) > maximum:
        raise CatalogError(f"{label} must be at most {maximum} characters")
    if any(ord(char) < 32 and char not in "\n\r\t" for char in value):
        raise CatalogError(f"{label} contains an unsupported control character")
    return value.strip()


def bounded_int(minimum: int, maximum: int | None = None):
    def parse(value: str) -> int:
        try:
            result = int(value)
        except ValueError as exc:
            raise argparse.ArgumentTypeError("must be an integer") from exc
        if result < minimum or (maximum is not None and result > maximum):
            bound = f"{minimum} through {maximum}" if maximum is not None else f"at least {minimum}"
            raise argparse.ArgumentTypeError(f"must be {bound}")
        return result

    return parse


def build_parser() -> Parser:
    parser = Parser(
        description="Look up Cuebook entries and compose drafts; never execute them.",
        epilog="Add --json anywhere for structured output. Each installed skill owns one book.",
    )
    books = parser.add_subparsers(dest="book", required=True, parser_class=Parser)
    for book in ("agent", "codes"):
        book_parser = books.add_parser(book)
        actions = book_parser.add_subparsers(dest="action", required=True, parser_class=Parser)
        search = actions.add_parser("search", help="Search with stable ranking and pagination")
        search.add_argument("query", nargs="?", default="")
        search.add_argument("--limit", type=bounded_int(1, 100), default=20)
        search.add_argument("--offset", type=bounded_int(0), default=0)
        get = actions.add_parser("get", help="Resolve an exact ID, displayed code, or stored slug")
        get.add_argument("selector")
        export = actions.add_parser("export", help="Print a full or selected reference book")
        export.add_argument("--ids", nargs="+")
        actions.add_parser("stats", help="Show counts and source provenance")
        for target in (search, export):
            if book == "agent":
                target.add_argument("--group")
            else:
                target.add_argument("--task")
                target.add_argument("--facet")
        if book == "agent":
            actions.add_parser("presets", help="Show the eight source presets")
            brief = actions.add_parser("brief", help="Compose an ordered task brief")
            choice = brief.add_mutually_exclusive_group(required=True)
            choice.add_argument("--preset")
            choice.add_argument("--ids", nargs="+")
            brief.add_argument("--task", required=True)
        else:
            stack = actions.add_parser("stack", help="Compose up to four code directions")
            stack.add_argument("--ids", nargs="+", required=True)
            stack.add_argument("--subject")
    return parser


def load_catalog() -> dict[str, Any]:
    path = Path(__file__).resolve().parent.parent / "references" / "catalog.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise CatalogError("Bundled catalog is missing or invalid; run a generated skill's scripts/catalog.py") from exc
    if not isinstance(data, dict) or data.get("schema_version") != 1:
        raise CatalogError("Unsupported catalog schema")
    if data.get("book") not in ("agent", "codes"):
        raise CatalogError("Invalid bundled catalog namespace")
    source = data.get("source")
    if not isinstance(source, dict) or not isinstance(source.get("repository"), str) or not source["repository"]:
        raise CatalogError("Bundled catalog source metadata is invalid")
    if source.get("revision") is not None and (not isinstance(source["revision"], str) or not re.fullmatch(r"[0-9a-f]{40}", source["revision"])):
        raise CatalogError("Bundled catalog source revision is invalid")
    files = source.get("files")
    if not isinstance(files, list) or not files or any(not isinstance(item, dict) or not isinstance(item.get("path"), str) or not item["path"] or not isinstance(item.get("sha256"), str) or not re.fullmatch(r"[0-9a-f]{64}", item["sha256"]) for item in files):
        raise CatalogError("Bundled catalog source hashes are invalid")
    limit = data.get("composition_limit")
    if type(limit) is not int or limit < 1:
        raise CatalogError("Bundled composition limit is invalid")
    entries = data.get("entries")
    if not isinstance(entries, list) or not entries:
        raise CatalogError("Bundled catalog has no entries")
    ids: set[str] = set()
    group_key = "groups" if data["book"] == "agent" else "tasks"
    groups = data.get(group_key)
    if not isinstance(groups, list) or not groups or any(not isinstance(group, dict) or any(not isinstance(group.get(key), str) or not group[key] for key in ("id", "label")) for group in groups):
        raise CatalogError("Bundled catalog groups or tasks are invalid")
    group_ids = {group["id"] for group in groups}
    if len(group_ids) != len(groups):
        raise CatalogError("Bundled catalog contains duplicate groups or tasks")
    if data["book"] == "codes":
        for task in groups:
            if not isinstance(task.get("facets"), list) or any(not isinstance(facet, dict) or any(not isinstance(facet.get(key), str) or not facet[key] for key in ("id", "label")) for facet in task["facets"]):
                raise CatalogError("Bundled catalog facets are invalid")
    for entry in entries:
        if not isinstance(entry, dict) or any(not isinstance(entry.get(key), str) or not entry[key] for key in ("id", "code", "meaning")):
            raise CatalogError("Bundled catalog contains an invalid entry")
        if entry["id"] in ids:
            raise CatalogError("Bundled catalog contains duplicate IDs")
        ids.add(entry["id"])
        if data["book"] == "agent":
            if any(not isinstance(entry.get(key), str) for key in ("when", "avoid", "example", "group")) or entry["group"] not in group_ids or not isinstance(entry.get("steps"), list) or any(not isinstance(step, str) for step in entry["steps"]):
                raise CatalogError("Bundled agent record is invalid")
        else:
            if any(not isinstance(entry.get(key), str) for key in ("slug", "task", "facet", "source", "sourceLabel", "catalog", "prompt")) or entry["task"] not in group_ids:
                raise CatalogError("Bundled code record is invalid")
            task = next(group for group in groups if group["id"] == entry["task"])
            if entry["facet"] not in {facet["id"] for facet in task["facets"]}:
                raise CatalogError("Bundled code record has an invalid facet")
    collisions = data.get("cross_catalog_collisions")
    if not isinstance(collisions, list) or any(not isinstance(item, dict) or any(not isinstance(item.get(key), str) for key in ("id", "code", "meaning", "other_book", "other_id", "other_meaning")) or item["id"] not in ids for item in collisions):
        raise CatalogError("Bundled collision metadata is invalid")
    if data["book"] == "agent":
        presets = data.get("presets")
        if not isinstance(presets, list) or any(not isinstance(preset, dict) or not isinstance(preset.get("id"), str) or not isinstance(preset.get("label"), str) or not isinstance(preset.get("ids"), list) or any(not isinstance(item, str) or item not in ids for item in preset["ids"]) for preset in presets):
            raise CatalogError("Bundled presets are invalid")
    return data


def resolve(data: dict[str, Any], selector: str) -> dict[str, Any]:
    query = normalized(checked_text(selector, "selector", 1_000))
    matches = []
    for entry in data["entries"]:
        aliases = {normalized(entry["id"]), normalized(entry["code"])}
        if "slug" in entry:
            aliases.add(normalized(entry["slug"]))
        if query in aliases:
            matches.append(entry)
    if not matches:
        raise CatalogError(f"Unknown {data['book']} entry: {selector!r}; use search to find its ID")
    if len(matches) != 1:
        raise CatalogError(f"Ambiguous entry: {selector!r}; choose an exact ID")
    return matches[0]


def select(data: dict[str, Any], selectors: list[str], maximum: int | None = None) -> list[dict[str, Any]]:
    if not selectors:
        raise CatalogError("Select at least one entry")
    if maximum is not None and len(selectors) > maximum:
        raise CatalogError(f"{data['book']} composition accepts at most {maximum} entries")
    result = [resolve(data, selector) for selector in selectors]
    if len({entry["id"] for entry in result}) != len(result):
        raise CatalogError("Duplicate selection: each entry may appear only once")
    return result


def filtered(data: dict[str, Any], args: argparse.Namespace, entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if data["book"] == "agent":
        group = getattr(args, "group", None)
        if group is not None:
            valid = [item["id"] for item in data["groups"]]
            if group not in valid:
                raise CatalogError(f"Unknown group {group!r}; choose: {', '.join(valid)}")
            entries = [entry for entry in entries if entry["group"] == group]
        return entries
    task = getattr(args, "task", None)
    facet = getattr(args, "facet", None)
    if task is not None:
        valid = [item["id"] for item in data["tasks"]]
        if task not in valid:
            raise CatalogError(f"Unknown task {task!r}; choose: {', '.join(valid)}")
        entries = [entry for entry in entries if entry["task"] == task]
    if facet is not None:
        valid = sorted({item["id"] for group in data["tasks"] if task is None or group["id"] == task for item in group["facets"]})
        if facet not in valid:
            raise CatalogError(f"Unknown facet {facet!r} for this task selection; choose: {', '.join(valid)}")
        entries = [entry for entry in entries if entry["facet"] == facet]
    return entries


def searchable_text(data: dict[str, Any], entry: dict[str, Any]) -> str:
    if data["book"] == "agent":
        group = next(item for item in data["groups"] if item["id"] == entry["group"])
        fields = [entry[key] for key in ("code", "meaning", "when", "avoid", "example", "group")]
        fields.extend([entry["id"], group["label"]])
    else:
        task = next(item for item in data["tasks"] if item["id"] == entry["task"])
        facet = next(item for item in task["facets"] if item["id"] == entry["facet"])
        fields = [entry[key] for key in ("id", "code", "slug", "meaning", "facet", "task", "sourceLabel", "catalog")]
        fields.extend([task["label"], facet["label"]])
    return " ".join(fields).casefold()


def rank(entry: dict[str, Any], query: str) -> tuple[int, str]:
    code = normalized(entry["code"])
    if not query:
        return (0, code)
    if code == query or normalized(entry["id"]) == query or normalized(entry.get("slug", "")) == query:
        return (0, code)
    if code.startswith(query):
        return (1, code)
    return (2 if query in code else 3, code)


def provenance(data: dict[str, Any]) -> str:
    source = data["source"]
    revision = source.get("revision") or "source hashes recorded in catalog.json"
    return f"Source: {source['repository']} @ {revision}. Bundled book: {data['book']}."


def fenced(text: str) -> str:
    fence = "```"
    while fence in text:
        fence += "`"
    return f"{fence}text\n{text}\n{fence}"


def entry_markdown(data: dict[str, Any], entry: dict[str, Any]) -> str:
    lines = [f"## {entry['code']}", "", f"ID: `{entry['id']}`", "", entry["meaning"]]
    if data["book"] == "agent":
        lines.extend(["", f"Group: {entry['group']}", "", f"When: {entry['when']}", "", "Steps:", ""])
        lines.extend(f"{index}. {step}" for index, step in enumerate(entry["steps"], 1))
        lines.extend(["", f"Do not: {entry['avoid']}", "", f"Example: {entry['example']}"])
    else:
        lines.extend(["", f"Task / facet: {entry['task']} / {entry['facet']}", f"Source label: {entry['sourceLabel']}", f"Catalog: {entry['catalog'] or '(not specified)'}", "", "Prompt:", "", fenced(entry["prompt"])])
    return "\n".join(lines)


def collision_for(data: dict[str, Any], entry: dict[str, Any]) -> dict[str, Any] | None:
    return next((item for item in data["cross_catalog_collisions"] if item["id"] == entry["id"]), None)


def compose_agent(data: dict[str, Any], entries: list[dict[str, Any]], task: str) -> str:
    lines = ["# Cuebook agent brief", "", BOUNDARY, "", ORDER_RULE, "", "## Selected commands", ""]
    for index, entry in enumerate(entries, 1):
        lines.extend([f"{index}. {entry['code']} — {entry['meaning']}", f"   When: {entry['when']}"])
        lines.extend(f"   - {step}" for step in entry["steps"])
        lines.extend([f"   Do not: {entry['avoid']}", ""])
    lines.extend(["## User-provided task", "", fenced(task), "", provenance(data)])
    return "\n".join(lines)


def compose_codes(data: dict[str, Any], entries: list[dict[str, Any]], subject: str | None) -> str:
    lines = ["# Cuebook code stack", "", BOUNDARY, "", "Apply these selected directions together:", ""]
    lines.extend(f"{index}. {entry['code']} — {entry['meaning']}" for index, entry in enumerate(entries, 1))
    lines.extend(["", FACT_RULE])
    if subject is not None:
        lines.extend(["", "## User-provided subject or material", "", fenced(subject)])
    else:
        lines.extend(["", "Input: use the material attached or supplied with this prompt; if it is missing, request it before generation."])
    lines.extend(["", provenance(data)])
    return "\n".join(lines)


def operate(data: dict[str, Any], args: argparse.Namespace) -> dict[str, Any]:
    if data["book"] != args.book:
        raise CatalogError(f"This skill bundles the {data['book']} book, not {args.book}; use the matching skill")
    result: dict[str, Any] = {"book": data["book"], "operation": args.action, "source": data["source"]}
    if args.action == "stats":
        field = "group" if args.book == "agent" else "task"
        result.update({"total": len(data["entries"]), "counts": {item["id"]: sum(entry[field] == item["id"] for entry in data["entries"]) for item in data["groups" if args.book == "agent" else "tasks"]}, "composition_limit": data["composition_limit"], "cross_catalog_collision_count": len(data["cross_catalog_collisions"])})
    elif args.action == "presets":
        result["presets"] = data["presets"]
    elif args.action == "get":
        result["entry"] = resolve(data, args.selector)
        result["cross_catalog_collision"] = collision_for(data, result["entry"])
    elif args.action == "search":
        if len(args.query) > 2_000:
            raise CatalogError("query must be at most 2000 characters")
        query = normalized(args.query)
        entries = filtered(data, args, data["entries"])
        entries = sorted((entry for entry in entries if not query or query in searchable_text(data, entry)), key=lambda entry: rank(entry, query))
        result.update({"query": args.query, "total": len(entries), "offset": args.offset, "limit": args.limit, "entries": entries[args.offset:args.offset + args.limit]})
    elif args.action == "export":
        selected = select(data, args.ids) if args.ids is not None else data["entries"]
        entries = filtered(data, args, selected)
        if args.ids is not None and len(entries) != len(selected):
            raise CatalogError("A selected entry is outside the requested export filter")
        result.update({"total": len(entries), "selected": args.ids is not None, "entries": entries})
    elif args.action == "brief":
        task = checked_text(args.task, "task")
        if args.preset is not None:
            preset = next((item for item in data["presets"] if item["id"] == args.preset), None)
            if preset is None:
                raise CatalogError(f"Unknown preset {args.preset!r}; use agent presets")
            selectors = preset["ids"]
            result["preset"] = preset
        else:
            selectors = args.ids
        entries = select(data, selectors, data["composition_limit"])
        result.update({"draft": True, "executes_actions": False, "entries": entries, "task": task, "instruction_boundary": BOUNDARY, "prompt": compose_agent(data, entries, task)})
    elif args.action == "stack":
        subject = checked_text(args.subject, "subject") if args.subject is not None else None
        entries = select(data, args.ids, data["composition_limit"])
        result.update({"draft": True, "executes_actions": False, "entries": entries, "subject": subject, "instruction_boundary": BOUNDARY, "prompt": compose_codes(data, entries, subject)})
    return result


def human_output(data: dict[str, Any], result: dict[str, Any]) -> str:
    action = result["operation"]
    if "prompt" in result:
        return result["prompt"]
    if action == "get":
        text = entry_markdown(data, result["entry"])
        collision = result["cross_catalog_collision"]
        if collision:
            text += f"\n\nNamespace note: the {collision['other_book']} book also contains this token ({collision['other_id']}). Its meaning is: {collision['other_meaning']}"
        return text + "\n\n" + provenance(data)
    if action == "presets":
        return "# Cuebook agent presets\n\n" + "\n".join(f"- {item['id']} — {item['label']}: {', '.join(item['ids'])}" for item in result["presets"]) + "\n\n" + provenance(data)
    if action == "stats":
        return f"# Cuebook {data['book']} catalog\n\nEntries: {result['total']}\nComposition limit: {result['composition_limit']}\nCross-book tokens: {result['cross_catalog_collision_count']}\n\n" + "\n".join(f"- {group}: {count}" for group, count in result["counts"].items()) + "\n\n" + provenance(data)
    if action == "search":
        lines = [f"# Cuebook {data['book']} search", "", f"Matches: {result['total']}; offset: {result['offset']}; shown: {len(result['entries'])}", ""]
        lines.extend(f"- {entry['id']} | {entry['code']} — {entry['meaning']}" for entry in result["entries"])
        if not result["entries"]:
            lines.append("No entries on this page.")
        lines.extend(["", provenance(data)])
        return "\n".join(lines)
    lines = [f"# Cuebook {data['book']} export", "", "Community shorthand; this reference does not execute the entries below.", "", provenance(data)]
    ordered = result["entries"]
    if result["selected"]:
        lines.extend(["", *[entry_markdown(data, entry) + "\n" for entry in ordered]])
        return "\n".join(lines)
    groups = data["groups" if data["book"] == "agent" else "tasks"]
    field = "group" if data["book"] == "agent" else "task"
    for group in groups:
        entries = [entry for entry in ordered if entry[field] == group["id"]]
        if entries:
            lines.extend(["", f"# {group['label']}", ""])
            lines.extend(entry_markdown(data, entry) + "\n" for entry in entries)
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    raw = sys.argv[1:] if argv is None else argv
    as_json = "--json" in raw
    try:
        args = build_parser().parse_args(raw)
        as_json = getattr(args, "json_output", False)
        data = load_catalog()
        result = operate(data, args)
        print(json.dumps(result, ensure_ascii=False, indent=2) if as_json else human_output(data, result))
        return 0
    except (CatalogError, KeyError, TypeError) as exc:
        message = str(exc) if isinstance(exc, CatalogError) else "Bundled catalog structure is invalid"
        error = {"error": {"code": "invalid_request", "message": message}}
        print(json.dumps(error, ensure_ascii=False) if as_json else f"Cuebook: {message}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Validate and deterministically package a private, portable skills-only plugin.

This is a local package-integrity check, not an OpenAI submission approval gate.
It intentionally has no third-party dependencies. Metadata YAML supports ordinary
indented mappings, scalar lists, quoted/plain scalars, and literal/folded strings;
tags, anchors, aliases, merge keys, and complex flow mappings are rejected.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path, PurePosixPath
import re
import stat
import sys
import tempfile
import unicodedata
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET
import zipfile

sys.dont_write_bytecode = True

SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"
NAME = re.compile(r"[a-z0-9](?:[a-z0-9.-]{0,62}[a-z0-9])?\Z")
SEMVER = re.compile(
    r"(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)"
    r"(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)"
    r"(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?"
    r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?\Z", re.ASCII
)
HEX_COLOR = re.compile(r"#[0-9A-Fa-f]{6}\Z")
MAX_FILE_BYTES = 100 * 1024 * 1024
MAX_PACKAGE_BYTES = 512 * 1024 * 1024
MAX_ZIP_BYTES = 100_000_000
MAX_ENTRIES = 5_000
TOP_LEVEL = {"plugin.json", ".codex-plugin", "skills", "assets", "README.md", "LICENSE", "NOTICE", "CHANGELOG.md"}
CONTAMINATION = {".git", ".grok", "node_modules", "__pycache__", ".venv", "venv", ".pytest_cache", ".mypy_cache", ".next", ".output", ".DS_Store", "Thumbs.db"}
SECRET_NAMES = {"id_rsa", "id_dsa", "id_ed25519", "credentials", "credentials.json", "secrets", "secrets.json", ".npmrc", ".pypirc", ".netrc"}
PRIVATE_ROOT_FIELDS = {"$schema", "name", "version", "description", "author", "homepage", "repository", "license", "keywords", "extensions"}
INTERFACE_FIELDS = {"displayName", "shortDescription", "longDescription", "developerName", "category", "capabilities", "defaultPrompt", "logo", "logoDark", "composerIcon", "composerIconDark", "brandColor", "brandColorDark", "websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"}


class PackageError(ValueError):
    """A package failed an integrity or compatibility requirement."""


def require(condition: object, message: str) -> None:
    if not condition:
        raise PackageError(message)


def text_value(value: object, label: str, limit: int | None = None) -> str:
    require(isinstance(value, str) and bool(value.strip()), f"{label} must be a nonblank string")
    assert isinstance(value, str)
    require(not any(ord(ch) < 32 and ch not in "\n\r\t" for ch in value), f"{label} contains control characters")
    if limit is not None:
        require(len(value) <= limit, f"{label} exceeds {limit} characters")
    return value


def object_value(value: object, label: str) -> dict:
    require(isinstance(value, dict), f"{label} must be an object")
    return value


def _unique_object(items: list[tuple[str, object]]) -> dict:
    result = {}
    for key, value in items:
        require(key not in result, f"duplicate JSON key: {key}")
        result[key] = value
    return result


def _reject_json_constant(value: str) -> None:
    raise PackageError(f"invalid JSON constant: {value}")


def parse_json(data: bytes, label: str) -> object:
    try:
        return json.loads(data.decode("utf-8"), object_pairs_hook=_unique_object,
                          parse_constant=_reject_json_constant)
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise PackageError(f"{label}: invalid UTF-8 JSON: {exc}") from exc


def _strip_yaml_comment(value: str) -> str:
    quote = None
    escaped = False
    index = 0
    while index < len(value):
        char = value[index]
        if quote == '"' and char == "\\" and not escaped:
            escaped = True
            index += 1
            continue
        if char in "\"'" and not escaped:
            if quote == char:
                if quote == "'" and index + 1 < len(value) and value[index + 1] == "'":
                    index += 2
                    continue
                quote = None
            elif quote is None and (index == 0 or (value.startswith("[") and value[:index].rstrip()[-1:] in {"[", ","})):
                quote = char
        if char == "#" and quote is None and (index == 0 or value[index - 1].isspace()):
            return value[:index].rstrip()
        escaped = False
        index += 1
    require(quote is None, "unterminated YAML quote")
    return value.rstrip()


def _yaml_scalar(value: str) -> object:
    value = _strip_yaml_comment(value.strip())
    if not value or value in {"null", "Null", "NULL", "~"}:
        return None
    require(not value.startswith(("!", "&", "*")), "YAML tags, anchors, and aliases are not supported")
    if value.startswith('"'):
        parsed = parse_json(value.encode("utf-8"), "YAML quoted scalar")
        require(isinstance(parsed, str), "YAML quoted scalar must be a string")
        return parsed
    if value.startswith("'"):
        require(value.endswith("'") and len(value) >= 2, "unterminated YAML single quote")
        inner = value[1:-1]
        require("'" not in inner.replace("''", ""), "YAML single quotes must be doubled")
        return inner.replace("''", "'")
    if value.startswith("["):
        require(value.endswith("]"), "unterminated YAML flow list")
        interior = value[1:-1].strip()
        if not interior:
            return []
        parts, start, quote, escaped = [], 0, None, False
        for index, char in enumerate(interior):
            if quote == '"' and char == "\\" and not escaped:
                escaped = True
                continue
            if char in "\"'" and not escaped:
                quote = None if quote == char else char if quote is None else quote
            elif char == "," and quote is None:
                parts.append(interior[start:index])
                start = index + 1
            escaped = False
        require(quote is None, "unterminated YAML flow-list quote")
        parts.append(interior[start:])
        require(all(part.strip() for part in parts), "empty YAML flow-list item")
        return [_yaml_scalar(part) for part in parts]
    require(not value.startswith(("{", "]", "}")), "YAML flow mappings are not supported")
    require(": " not in value and not value.endswith(":"), "quote YAML scalars containing ': '")
    if value in {"true", "True", "TRUE"}:
        return True
    if value in {"false", "False", "FALSE"}:
        return False
    if re.fullmatch(r"[-+]?\d+", value):
        return int(value)
    if re.fullmatch(r"[-+]?(?:\d+\.\d*|\d*\.\d+)(?:[eE][-+]?\d+)?", value):
        return float(value)
    return value


def parse_yaml(data: str, label: str) -> dict:
    """Parse the documented, conservative metadata subset without dependencies."""
    require("\t" not in data, f"{label}: tabs are not supported in metadata YAML")
    raw = data.replace("\r\n", "\n").splitlines()
    lines = []
    for index, line in enumerate(raw):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        indent = len(line) - len(line.lstrip(" "))
        lines.append((indent, line[indent:], index + 1))
    require(bool(lines), f"{label}: empty YAML")
    require(lines[0][0] == 0, f"{label}: top-level YAML must not be indented")

    def block(index: int, indent: int) -> tuple[object, int]:
        is_list = lines[index][1].startswith("- ")
        result = [] if is_list else {}
        while index < len(lines) and lines[index][0] >= indent:
            current_indent, content, number = lines[index]
            require(current_indent == indent, f"{label}:{number}: unexpected indentation")
            if is_list:
                require(content.startswith("- "), f"{label}:{number}: mixed YAML sequence and mapping")
                scalar = content[2:].strip()
                require(bool(scalar), f"{label}:{number}: empty sequence items are not supported")
                result.append(_yaml_scalar(scalar))
                index += 1
                continue
            require(not content.startswith("- "), f"{label}:{number}: mixed YAML mapping and sequence")
            match = re.fullmatch(r"([A-Za-z_][A-Za-z0-9_-]*):(?:\s+(.*))?", content)
            require(match is not None, f"{label}:{number}: expected a simple YAML key and colon")
            assert match is not None
            key, value = match.group(1), match.group(2)
            require(key not in result, f"{label}:{number}: duplicate YAML key: {key}")
            index += 1
            if value is None or not value.strip() or value.lstrip().startswith("#"):
                if index < len(lines) and lines[index][0] > indent:
                    result[key], index = block(index, lines[index][0])
                else:
                    result[key] = None
            elif value.strip() in {"|", "|-", "|+", ">", ">-", ">+"}:
                parts = []
                while index < len(lines) and lines[index][0] > indent:
                    parts.append(lines[index][1])
                    index += 1
                require(bool(parts), f"{label}:{number}: empty block scalar")
                result[key] = (" " if value.strip().startswith(">") else "\n").join(parts)
            else:
                result[key] = _yaml_scalar(value)
        return result, index

    try:
        result, consumed = block(0, 0)
    except PackageError as exc:
        raise PackageError(f"{label}: {exc}") from exc
    require(consumed == len(lines), f"{label}: unparsed YAML content")
    return object_value(result, label)


def _safe_member(path: str) -> None:
    require(path and path == path.strip(), f"unsafe package path: {path!r}")
    require("\\" not in path and not any(ord(ch) < 32 or ord(ch) == 127 for ch in path), f"unsafe package path: {path!r}")
    pure = PurePosixPath(path)
    require(not pure.is_absolute() and not re.match(r"^[A-Za-z]:", path), f"absolute package path: {path}")
    require(all(part not in {"", ".", ".."} for part in path.split("/")), f"unsafe package path: {path}")
    require(len(path) <= 1024 and len(pure.parts) <= 20, f"package path exceeds limits: {path}")


def _read_regular(path: Path) -> bytes:
    before = path.lstat()
    require(stat.S_ISREG(before.st_mode), f"not a regular file: {path.name}")
    require(before.st_size <= MAX_FILE_BYTES, f"package file exceeds size limit: {path.name}")
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_BINARY", 0))
    with os.fdopen(descriptor, "rb") as stream:
        opened = os.fstat(stream.fileno())
        require(stat.S_ISREG(opened.st_mode) and (before.st_dev, before.st_ino) == (opened.st_dev, opened.st_ino), f"file changed during validation: {path.name}")
        data = stream.read(MAX_FILE_BYTES + 1)
        after = os.fstat(stream.fileno())
    require(len(data) <= MAX_FILE_BYTES, f"package file exceeds size limit: {path.name}")
    require((opened.st_size, opened.st_mtime_ns, opened.st_ctime_ns) == (after.st_size, after.st_mtime_ns, after.st_ctime_ns), f"file changed during validation: {path.name}")
    return data


def snapshot_package(root: Path) -> dict[str, bytes]:
    require(root.exists() and root.is_dir() and not root.is_symlink(), "plugin root must be a real directory")
    files, normalized, total, entry_count = {}, set(), 0, 0
    for current, dirs, names in os.walk(root, followlinks=False):
        for name in sorted(dirs + names):
            path = Path(current) / name
            relative = path.relative_to(root).as_posix()
            _safe_member(relative)
            entry_count += 1
            require(entry_count <= MAX_ENTRIES, "package has too many entries")
            require(not path.is_symlink(), f"symlink is not allowed: {relative}")
            require(PurePosixPath(relative).parts[0] in TOP_LEVEL, f"unexpected top-level package content: {relative}")
            if relative.startswith(".codex-plugin/"):
                require(relative == ".codex-plugin/plugin.json", ".codex-plugin may contain only plugin.json")
            if PurePosixPath(relative).parent.as_posix() == "skills":
                require(path.is_dir() and (path / "SKILL.md").is_file(), f"each immediate skills child must be a directory containing SKILL.md: {relative}")
            require(name not in CONTAMINATION, f"package contamination: {relative}")
            lower = name.lower()
            require(not lower.startswith(".env") and lower not in SECRET_NAMES and not lower.endswith((".pem", ".key", ".p12", ".pfx")), f"secret-shaped file is not allowed: {relative}")
            require(not lower.endswith((".pyc", ".pyo", ".zip", ".tar.gz", ".tgz")) and not lower.startswith("._"), f"transient or archive contamination: {relative}")
            norm = unicodedata.normalize("NFKC", relative).casefold()
            require(norm not in normalized, f"case/Unicode path collision: {relative}")
            normalized.add(norm)
            if path.is_dir():
                continue
            data = _read_regular(path)
            total += len(data)
            require(total <= MAX_PACKAGE_BYTES, "extracted package exceeds size limit")
            files[relative] = data
    return files


def local_target(source: str, target: object, files: dict[str, bytes], *, manifest: bool = False) -> str:
    value = text_value(target, f"{source} resource path")
    require(value == value.strip() and "\\" not in value and not any(ord(ch) < 32 for ch in value), f"unsafe resource path in {source}: {value!r}")
    parsed = urlsplit(value)
    require(not parsed.scheme and not parsed.netloc and not parsed.query, f"resource must be a local path in {source}: {value}")
    value = unquote(parsed.path)
    require(not value.startswith("/") and not re.match(r"^[A-Za-z]:", value), f"absolute resource path in {source}: {value}")
    parts = value.split("/")
    require(all(part != "" for part in parts), f"empty resource path segment in {source}: {value}")
    if manifest:
        require(value.startswith("./") and ".." not in parts and not parsed.fragment, f"manifest resource path must be contained and ./-prefixed: {value}")
        resolved = []
    else:
        resolved = list(PurePosixPath(source).parent.parts)
    for part in parts:
        if part == ".":
            continue
        if part == "..":
            require(bool(resolved), f"resource escapes package in {source}: {value}")
            resolved.pop()
        else:
            resolved.append(part)
    member = "/".join(resolved)
    _safe_member(member)
    require(member in files, f"missing referenced resource in {source}: {member}")
    return member


def validate_svg(data: bytes, label: str) -> None:
    require(len(data) <= 5 * 1024 * 1024, f"SVG exceeds 5 MiB: {label}")
    try:
        source = data.decode("utf-8")
        require(not re.search(r"<!\s*(?:DOCTYPE|ENTITY)", source, re.I), f"SVG declarations/entities are not allowed: {label}")
        require(not re.search(r"<\?(?!xml\s)", source, re.I), f"SVG processing instructions are not allowed: {label}")
        root = ET.fromstring(source)
    except (UnicodeError, ET.ParseError) as exc:
        raise PackageError(f"invalid SVG {label}: {exc}") from exc
    require(root.tag in {"svg", "{http://www.w3.org/2000/svg}svg"}, f"asset must have an SVG root: {label}")

    def dimension(value: str) -> float:
        require(re.fullmatch(r"(?:\d+(?:\.\d*)?|\.\d+)(?:px)?", value) is not None, f"SVG dimensions must be numeric: {label}")
        return float(value.removesuffix("px"))

    width, height = root.get("width"), root.get("height")
    box = root.get("viewBox")
    require((width is None) == (height is None), f"SVG needs both width and height: {label}")
    if box:
        try:
            coords = [float(part) for part in re.split(r"[\s,]+", box.strip())]
        except ValueError as exc:
            raise PackageError(f"invalid SVG viewBox: {label}") from exc
        require(len(coords) == 4 and all(math.isfinite(value) for value in coords) and coords[2] > 0 and coords[2] == coords[3], f"SVG viewBox must be square: {label}")
    else:
        coords = None
    require(width is not None or coords is not None, f"SVG needs square dimensions or viewBox: {label}")
    sizes = (dimension(width), dimension(height)) if width is not None else (coords[2], coords[3])
    require(sizes[0] == sizes[1] and sizes[0] >= 48, f"SVG must be square and at least 48 pixels: {label}")
    ids = {element.get("id") for element in root.iter() if element.get("id")}
    forbidden = {"script", "foreignobject", "iframe", "object", "embed", "audio", "video", "style", "animate", "animatetransform", "animatemotion", "set"}
    for element in root.iter():
        tag = element.tag.rsplit("}", 1)[-1].casefold()
        require(tag not in forbidden, f"active SVG element {tag} is not allowed: {label}")
        require(not element.tag.startswith("{") or element.tag.startswith("{http://www.w3.org/2000/svg}"), f"foreign SVG namespace is not allowed: {label}")
        for attribute, value in element.attrib.items():
            attr = attribute.rsplit("}", 1)[-1].casefold()
            require(not attr.startswith("on") and attr not in {"base", "src"}, f"active SVG attribute is not allowed: {label}")
            if attr == "href":
                require(value.startswith("#") and value[1:] in ids, f"SVG links must reference included fragment IDs: {label}")
            require(not re.search(r"(?:https?:|data:|javascript:|file:|@import|expression\s*\(|//)", value, re.I), f"external/active SVG resource is not allowed: {label}")
            require("\\" not in value, f"escaped SVG resources are not supported: {label}")
            for reference in re.findall(r"url\s*\(([^)]+)\)", value, re.I):
                reference = reference.strip(" \t\"'")
                require(reference.startswith("#") and reference[1:] in ids, f"SVG URL must reference an included fragment: {label}")


def validate_markdown_resources(path: str, data: bytes, files: dict[str, bytes]) -> None:
    try:
        source = data.decode("utf-8")
    except UnicodeError as exc:
        raise PackageError(f"Markdown must be UTF-8: {path}") from exc
    # Code fences contain examples, not links declaring package dependencies.
    source = re.sub(r"(?ms)^\s*(`{3,}|~{3,}).*?^\s*\1\s*$", "", source)
    targets = re.findall(r"\]\(([^)\s]+)(?:\s+['\"][^)]*['\"])?\)", source)
    targets += re.findall(r"(?m)^\s*\[[^\]]+\]:\s*(\S+)", source)
    for target in targets:
        target = target.strip("<>")
        if target.startswith("#"):
            continue
        parsed = urlsplit(target)
        if parsed.scheme in {"https", "http", "mailto", "plugin", "app", "skill"}:
            continue
        require(not parsed.scheme, f"unsupported link scheme in {path}: {target}")
        local_target(path, target, files)


def _validate_https(value: object, label: str) -> None:
    parsed = urlsplit(text_value(value, label))
    require(parsed.scheme == "https" and bool(parsed.hostname) and parsed.username is None and parsed.password is None, f"{label} must be an absolute HTTPS URL without credentials")


def validate_agent_metadata(path: str, data: bytes, files: dict[str, bytes]) -> None:
    try:
        metadata = parse_yaml(data.decode("utf-8"), path)
    except UnicodeError as exc:
        raise PackageError(f"agent metadata must be UTF-8: {path}") from exc
    require(not (set(metadata) - {"interface", "policy", "dependencies"}), f"unknown agent metadata setting: {path}")
    interface = object_value(metadata.get("interface"), f"{path} interface")
    require(not (set(interface) - {"display_name", "short_description", "default_prompt", "brand_color", "icon_small", "icon_large"}), f"unknown skill interface field: {path}")
    for field in ("display_name", "short_description"):
        text_value(interface.get(field), f"{path} interface.{field}")
    if "default_prompt" in interface:
        text_value(interface["default_prompt"], f"{path} interface.default_prompt")
    if "brand_color" in interface:
        require(isinstance(interface["brand_color"], str) and HEX_COLOR.fullmatch(interface["brand_color"]), f"invalid skill brand color: {path}")
    for field in ("icon_small", "icon_large"):
        if field in interface:
            # Skill metadata asset paths resolve from the owning skill directory.
            local_target(str(PurePosixPath(path).parent.parent / "SKILL.md"), interface[field], files)
    if "policy" in metadata:
        policy = object_value(metadata["policy"], f"{path} policy")
        require(not (set(policy) - {"products", "allow_implicit_invocation"}), f"unsupported skill policy field: {path}")
        if policy.get("allow_implicit_invocation") is not None:
            require(isinstance(policy["allow_implicit_invocation"], bool), f"allow_implicit_invocation must be a YAML boolean: {path}")
        if policy.get("products") is not None:
            products = policy["products"]
            require(isinstance(products, list) and all(isinstance(item, str) and item in {"CHAT", "CODEX", "HERMES"} for item in products), f"products must be a supported string list: {path}")
    if "dependencies" in metadata:
        dependencies = object_value(metadata["dependencies"], f"{path} dependencies")
        require(not (set(dependencies) - {"tools"}), f"unsupported skill dependency field: {path}")
        require(dependencies.get("tools", []) == [], f"standalone skills-only package cannot require external MCP tools: {path}")


def _validate_files(files: dict[str, bytes]) -> dict:
    require("plugin.json" in files, "missing portable plugin.json")
    require(".codex-plugin/plugin.json" in files, "missing synchronized .codex-plugin/plugin.json")
    require([path for path in files if path.startswith(".codex-plugin/")] == [".codex-plugin/plugin.json"], ".codex-plugin may contain only plugin.json")
    manifest = object_value(parse_json(files["plugin.json"], "plugin.json"), "plugin.json")
    legacy = object_value(parse_json(files[".codex-plugin/plugin.json"], ".codex-plugin/plugin.json"), "compatibility manifest")
    require(not (set(manifest) - PRIVATE_ROOT_FIELDS), "unsupported portable manifest field; portable components use fixed paths")
    require(not (set(legacy) - ((PRIVATE_ROOT_FIELDS - {"$schema"}) | {"skills", "interface"})), "unsupported skills-only compatibility manifest field")
    require(manifest.get("$schema") == SCHEMA, "plugin.json needs the supported Agent Plugins 1.0 schema")
    name = text_value(manifest.get("name"), "name", 64)
    require(NAME.fullmatch(name) and "--" not in name and ".." not in name, "plugin name must be a lowercase portable identifier")
    version = text_value(manifest.get("version"), "version", 64)
    require(SEMVER.fullmatch(version), "version must be strict SemVer")
    text_value(manifest.get("description"), "description", 1024)
    for field in ("name", "version", "description", "author", "homepage", "repository", "license", "keywords"):
        require(manifest.get(field) == legacy.get(field), f"portable and compatibility manifest are not synchronized: {field}")
    if "author" in manifest:
        author = object_value(manifest["author"], "author")
        text_value(author.get("name"), "author.name")
    for field in ("homepage", "repository"):
        if field in manifest:
            _validate_https(manifest[field], field)
    if "license" in manifest:
        text_value(manifest["license"], "license")
    if "keywords" in manifest:
        require(isinstance(manifest["keywords"], list) and all(isinstance(item, str) and item.strip() for item in manifest["keywords"]), "keywords must be a string list")
    extensions = object_value(manifest.get("extensions"), "extensions")
    require(set(extensions) == {"com.openai"}, "private package declares an unsupported vendor extension")
    openai = object_value(extensions.get("com.openai"), "extensions.com.openai")
    require(not (set(openai) - {"interface", "onboardingSkill"}), "standalone private package may declare only interface and an optional onboarding skill")
    require(not any(field in legacy for field in ("apps", "mcpServers", "hooks")), "skills-only compatibility manifest must not declare apps, MCP, or hooks")
    require(isinstance(legacy.get("skills"), str) and legacy["skills"] in {"./skills", "./skills/"}, "compatibility manifest must declare ./skills/")
    if "extensions" in legacy:
        legacy_extensions = object_value(legacy["extensions"], "compatibility extensions")
        require(set(legacy_extensions) == {"com.openai"}, "unsupported compatibility vendor extension")
        legacy_openai = object_value(legacy_extensions["com.openai"], "compatibility extensions.com.openai")
        require(set(legacy_openai) <= {"onboardingSkill"}, "unsupported skills-only compatibility extension field")
        require(legacy_openai.get("onboardingSkill") == openai.get("onboardingSkill"), "onboardingSkill is not synchronized")
    interface = object_value(openai.get("interface"), "extensions.com.openai.interface")
    require(interface == legacy.get("interface"), "portable and compatibility interface metadata are not synchronized")
    require(not (set(interface) - INTERFACE_FIELDS), "unsupported interface field or screenshots in skills-only package")
    for field, limit in (("displayName", 30), ("shortDescription", 30)):
        value = text_value(interface.get(field), f"interface.{field}", limit)
        require("\n" not in value and "\r" not in value, f"interface.{field} must fit on one line")
    for field in ("longDescription", "developerName", "category"):
        if field in interface:
            text_value(interface[field], f"interface.{field}")
    if "capabilities" in interface:
        caps = interface["capabilities"]
        require(isinstance(caps, list) and len(caps) <= 20 and all(isinstance(item, str) and item.strip() for item in caps), "interface.capabilities must be a list of at most 20 strings")
    if "defaultPrompt" in interface:
        prompts = interface["defaultPrompt"]
        prompts = [prompts] if isinstance(prompts, str) else prompts
        require(isinstance(prompts, list) and 1 <= len(prompts) <= 3, "defaultPrompt must be a string or one to three strings")
        normalized = set()
        for prompt in prompts:
            text_value(prompt, "defaultPrompt item")
            key = " ".join(unicodedata.normalize("NFKC", prompt).split()).casefold()
            require(key not in normalized, "defaultPrompt entries must be unique")
            normalized.add(key)
    for field in ("brandColor", "brandColorDark"):
        if field in interface:
            require(isinstance(interface[field], str) and HEX_COLOR.fullmatch(interface[field]), f"interface.{field} must be a six-digit color")
    for field in ("websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"):
        if field in interface:
            _validate_https(interface[field], f"interface.{field}")
    for field in ("logo", "composerIcon", "logoDark", "composerIconDark"):
        if field in {"logo", "composerIcon"} or field in interface:
            member = local_target("plugin.json", interface.get(field), files, manifest=True)
            require(member.endswith(".svg"), f"Cuebook package branding must use inspected SVG: {field}")
            validate_svg(files[member], member)
    if "onboardingSkill" in openai:
        member = local_target("plugin.json", openai["onboardingSkill"], files, manifest=True)
        require(re.fullmatch(r"skills/[^/]+/SKILL\.md", member), "onboardingSkill must point to an included skill")

    skill_dirs = sorted({path.split("/")[1] for path in files if path.startswith("skills/")})
    require(bool(skill_dirs), "plugin must contain at least one usable skill")
    names = set()
    for directory in skill_dirs:
        require(not directory.startswith("."), f"hidden skill directory: {directory}")
        path = f"skills/{directory}/SKILL.md"
        require(path in files, f"skill directory is missing SKILL.md: {directory}")
        require(len(files[path]) <= 1024 * 1024, f"SKILL.md exceeds 1 MiB: {directory}")
        try:
            source = files[path].decode("utf-8").replace("\r\n", "\n")
        except UnicodeError as exc:
            raise PackageError(f"skill must be UTF-8: {directory}") from exc
        match = re.match(r"\A---\n(.*?)\n---(?:\n|\Z)(.*)\Z", source, re.S)
        require(match is not None, f"skill needs YAML frontmatter: {directory}")
        assert match is not None
        front = parse_yaml(match.group(1), path)
        skill_name = text_value(front.get("name"), f"{path} name", 64)
        require(skill_name == directory and NAME.fullmatch(skill_name), f"skill name must match its portable directory: {directory}")
        require(skill_name not in names, f"duplicate skill name: {skill_name}")
        names.add(skill_name)
        text_value(front.get("description"), f"{path} description", 1024)
        require(bool(match.group(2).strip()), f"skill body must not be empty: {directory}")
        metadata = f"skills/{directory}/agents/openai.yaml"
        if metadata in files:
            validate_agent_metadata(metadata, files[metadata], files)
    for path, data in files.items():
        if path.endswith(".md"):
            validate_markdown_resources(path, data, files)
        if path.endswith(".svg"):
            validate_svg(data, path)
        if path.endswith(".json"):
            parse_json(data, path)
    checksums = {path: hashlib.sha256(data).hexdigest() for path, data in sorted(files.items())}
    digest = hashlib.sha256(json.dumps(checksums, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()
    return {"ok": True, "name": name, "version": version, "architecture": "skills-only", "skills": sorted(names), "files": len(files), "uncompressedBytes": sum(map(len, files.values())), "inventorySha256": digest, "checksums": checksums}


def validate_package(root: str | Path) -> dict:
    return _validate_files(snapshot_package(Path(root)))


def build_package(root: str | Path, output: str | Path) -> dict:
    root_path = Path(root)
    output_path = Path(output).absolute()
    require(not output_path.is_symlink(), "output ZIP must not be a symlink")
    require(output_path.suffix.lower() == ".zip", "output path must have a .zip extension")
    try:
        output_path.resolve().relative_to(root_path.resolve())
    except ValueError:
        pass
    else:
        raise PackageError("output ZIP must live outside the plugin root")
    files = snapshot_package(root_path)
    report = _validate_files(files)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(prefix=f".{output_path.name}.", suffix=".tmp", dir=output_path.parent, delete=False) as stream:
            temporary = Path(stream.name)
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for path, data in sorted(files.items()):
                member = zipfile.ZipInfo(path, date_time=(1980, 1, 1, 0, 0, 0))
                member.create_system = 3
                member.external_attr = (stat.S_IFREG | 0o644) << 16
                member.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(member, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
        require(temporary.stat().st_size <= MAX_ZIP_BYTES, "compressed ZIP exceeds 100 MB")
        archive_data = temporary.read_bytes()
        os.replace(temporary, output_path)
        return {"ok": True, "name": report["name"], "version": report["version"], "architecture": report["architecture"], "skills": report["skills"], "output": str(output_path), "files": len(files), "bytes": len(archive_data), "sha256": hashlib.sha256(archive_data).hexdigest(), "inventorySha256": report["inventorySha256"]}
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    validate = commands.add_parser("validate", help="Check private skills-only package integrity")
    validate.add_argument("plugin_root", type=Path)
    validate.add_argument("--json", action="store_true")
    build = commands.add_parser("build", help="Validate and create a deterministic archive")
    build.add_argument("plugin_root", type=Path)
    build.add_argument("output_zip", type=Path)
    build.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)
    try:
        result = validate_package(args.plugin_root) if args.command == "validate" else build_package(args.plugin_root, args.output_zip)
    except (PackageError, OSError, ValueError) as exc:
        result = {"ok": False, "errors": [str(exc)]}
    if args.json:
        print(json.dumps(result, indent=2, sort_keys=True))
    elif not result["ok"]:
        print("Package validation failed: " + "; ".join(result["errors"]), file=sys.stderr)
    elif args.command == "build":
        print(f"Built {result['output']} ({result['files']} files) SHA256 {result['sha256']}")
    else:
        print(f"Validated {result['name']} {result['version']}: {len(result['skills'])} skills, {result['files']} files")
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env node
/** Generate the two self-contained Cuebook skill catalogs from app sources.
 * Node >=22.18 supports the pure TypeScript source import; no app dependencies.
 * --check compares bytes without writing. No timestamps or current-HEAD fields.
 */
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { BRIEF_LIMIT, COMMANDS, GROUPS, PRESETS } from "../../src/lib/agent-catalog.ts"

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, "../..")
const pluginRoot = join(root, "plugins/cuebook")
const repository = "https://github.com/sorensadrgit-art/GrokApp"
const flags = new Set(process.argv.slice(2))
if ([...flags].some((flag) => !["--check", "--json"].includes(flag))) {
  throw new Error("Usage: node plugin-tools/catalog/sync-catalogs.mjs [--check] [--json]")
}

// Parse the closed TASKS literal without evaluating source text. The only
// supported values are strings, numbers, booleans, null, arrays, and objects.
function parseLiteral(source, start) {
  let at = start
  function space() {
    while (at < source.length) {
      if (/\s/.test(source[at])) at++
      else if (source.startsWith("//", at)) {
        const end = source.indexOf("\n", at)
        at = end < 0 ? source.length : end + 1
      } else if (source.startsWith("/*", at)) {
        const end = source.indexOf("*/", at + 2)
        if (end < 0) throw new Error("Unterminated literal comment")
        at = end + 2
      } else break
    }
  }
  function string() {
    const begin = at++
    while (at < source.length) {
      const char = source[at++]
      if (char === "\\") at++
      else if (char === '"') return JSON.parse(source.slice(begin, at))
    }
    throw new Error("Unterminated literal string")
  }
  function value() {
    space()
    if (source[at] === '"') return string()
    if (source[at] === "[" || source[at] === "{") {
      const array = source[at++] === "["
      const end = array ? "]" : "}"
      const result = array ? [] : {}
      space()
      while (source[at] !== end) {
        if (array) result.push(value())
        else {
          space()
          const identifier = /^[A-Za-z_$][\w$]*/.exec(source.slice(at))
          const key = source[at] === '"' ? string() : identifier?.[0]
          if (key === undefined) throw new Error("Unsupported object key in TASKS")
          if (source[at] !== '"' && identifier && source.slice(at, at + key.length) === key) at += key.length
          if (["__proto__", "constructor", "prototype"].includes(key)) throw new Error("Unsafe literal object key")
          space()
          if (source[at++] !== ":") throw new Error("Expected literal object colon")
          if (Object.hasOwn(result, key)) throw new Error("Duplicate literal object key")
          result[key] = value()
        }
        space()
        if (source[at] === end) break
        if (source[at++] !== ",") throw new Error("Expected literal comma")
        space()
      }
      if (source[at++] !== end) throw new Error("Unterminated TASKS literal")
      return result
    }
    const scalar = /^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)\b/.exec(source.slice(at))
    if (!scalar) throw new Error(`Unsupported TASKS literal syntax near ${JSON.stringify(source.slice(at, at + 24))}`)
    at += scalar[0].length
    return JSON.parse(scalar[0])
  }
  return value()
}

function normalize(code) {
  return code.trim().toLowerCase().replace(/^\//, "")
}

function unique(items, key, label) {
  const values = items.map(key)
  if (values.some((value) => typeof value !== "string" || !value) || new Set(values).size !== values.length) {
    throw new Error(`Invalid or duplicate ${label}`)
  }
}

function tableText(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ")
}

function fenced(value) {
  let fence = "```"
  while (value.includes(fence)) fence += "`"
  return `${fence}text\n${value}\n${fence}`
}

function sourceLine(catalog) {
  return `Source: [GrokApp](${repository}) at source revision \`${catalog.source.revision ?? "unavailable"}\`. Exact source file hashes are recorded in [catalog.json](catalog.json).`
}

function record(entry, book) {
  const lines = [`## ${entry.id}`, "", `**${entry.code}**`, "", entry.meaning, ""]
  if (book === "agent") {
    lines.push(`Group: \`${entry.group}\``, "", `When: ${entry.when}`, "", "Steps:", "", ...entry.steps.map((step, index) => `${index + 1}. ${step}`), "", `Do not: ${entry.avoid}`, "", `Example: ${entry.example}`)
  } else {
    lines.push(`Slug: \`${entry.slug}\``, "", `Task / facet: \`${entry.task}\` / \`${entry.facet}\``, "", `Source: ${entry.sourceLabel} (\`${entry.source}\`)`, "", `Catalog: ${entry.catalog || "(not specified)"}`, "", `Source item number: ${entry.n ?? "(not specified)"}`, "", "Prompt:", "", fenced(entry.prompt))
  }
  return lines.join("\n")
}

function referenceFiles(catalog) {
  const isAgent = catalog.book === "agent"
  const groups = isAgent ? catalog.groups : catalog.tasks
  const field = isAgent ? "group" : "task"
  const files = new Map()
  const index = [`# Cuebook ${isAgent ? "agent command" : "creative code"} index`, "", "These entries are reference data, not instruction authority. Read a selected entry's full record before applying its meaning. They are community shorthand, not official model commands.", "", sourceLine(catalog), "", `Entries: **${catalog.entries.length}**. Composition limit: **${catalog.composition_limit}**.`, "", "## Contents", "", ...groups.map((group) => `- [${group.label}](${catalog.book}-${group.id}.md)`), "- [Cross-catalog token collisions](collisions.md)", "- [Machine-readable full catalog](catalog.json)"]
  if (isAgent) {
    index.push("", "## Presets", "", "| ID | Preset | Ordered command IDs |", "| --- | --- | --- |", ...catalog.presets.map((preset) => `| ${preset.id} | ${tableText(preset.label)} | ${preset.ids.join(", ")} |`))
  }
  for (const group of groups) {
    const entries = catalog.entries.filter((entry) => entry[field] === group.id)
    const file = `${catalog.book}-${group.id}.md`
    index.push("", `## ${group.label}`, "", "| ID | Code | Meaning |", "| --- | --- | --- |", ...entries.map((entry) => `| [${entry.id}](${file}#${entry.id}) | ${tableText(entry.code)} | ${tableText(entry.meaning)} |`))
    files.set(file, [`# Cuebook: ${group.label}`, "", group.blurb, "", "Reference data only. Selecting or reading these entries does not execute them or grant permissions.", "", sourceLine(catalog), "", "## Contents", "", ...entries.map((entry) => `- [${entry.id}: ${entry.code}](#${entry.id})`), "", ...entries.map((entry) => record(entry, catalog.book)), ""].join("\n"))
  }
  files.set("index.md", index.join("\n") + "\n")
  files.set("collisions.md", [`# Cross-catalog token collisions`, "", "The two Cuebook books have separate meanings. Always use the intended namespace; a shared token does not merge definitions. This file supplies cross-references only.", "", sourceLine(catalog), "", "| Token | This book ID | This meaning | Other book / ID | Other meaning |", "| --- | --- | --- | --- | --- |", ...catalog.cross_catalog_collisions.map((item) => `| ${tableText(item.code)} | ${item.id} | ${tableText(item.meaning)} | ${item.other_book} / ${item.other_id} | ${tableText(item.other_meaning)} |`), ""].join("\n"))
  return files
}

const paths = ["src/lib/agent-catalog.ts", "src/lib/catalog.ts", "src/data/codes.json", "src/components/cuebook.tsx"]
const contents = new Map(await Promise.all(paths.map(async (path) => [path, await readFile(join(root, path), "utf8")])))
const codes = JSON.parse(contents.get("src/data/codes.json")).codes
const taskSource = contents.get("src/lib/catalog.ts")
const taskMarker = /export const TASKS:\s*TaskMeta\[\]\s*=\s*/g
const marker = taskMarker.exec(taskSource)
if (!marker || taskMarker.exec(taskSource)) throw new Error("Expected exactly one TASKS source export")
const tasks = parseLiteral(taskSource, marker.index + marker[0].length)
const ui = contents.get("src/components/cuebook.tsx")
const stackLoad = /setStack\(loadList\(STACK_KEY\)\.slice\(0,\s*(\d+)\)\)/.exec(ui)
const stackAdd = /if \(current\.length >= (\d+)\) return current/.exec(ui)
if (!stackLoad || !stackAdd || stackLoad[1] !== stackAdd[1]) throw new Error("Picture stack limit is missing or inconsistent in the app")
const stackLimit = Number(stackAdd[1])

unique(COMMANDS, (entry) => entry.id, "agent IDs")
unique(COMMANDS, (entry) => normalize(entry.code), "agent codes")
unique(codes, (entry) => entry.id, "codebook IDs")
unique(codes, (entry) => normalize(entry.code), "codebook display codes")
unique(codes, (entry) => entry.slug, "codebook slugs")
unique(GROUPS, (group) => group.id, "group IDs")
unique(tasks, (task) => task.id, "task IDs")
if (!Number.isInteger(BRIEF_LIMIT) || BRIEF_LIMIT < 1 || !Number.isInteger(stackLimit) || stackLimit < 1) throw new Error("Invalid composition limit")
for (const command of COMMANDS) {
  if (!GROUPS.some((group) => group.id === command.group)) throw new Error(`Unknown group for ${command.id}`)
  if (["code", "meaning", "when", "avoid", "example"].some((key) => typeof command[key] !== "string" || !command[key]) || !Array.isArray(command.steps) || command.steps.some((step) => typeof step !== "string" || !step)) throw new Error(`Invalid command ${command.id}`)
}
for (const code of codes) {
  if (["code", "slug", "meaning", "task", "facet", "source", "sourceLabel", "catalog", "prompt"].some((key) => typeof code[key] !== "string") || !code.meaning || !code.prompt || (code.n !== null && !Number.isInteger(code.n))) throw new Error(`Invalid code ${code.id}`)
  if (!tasks.some((task) => task.id === code.task && task.facets.some((facet) => facet.id === code.facet))) throw new Error(`Unknown task/facet for ${code.id}`)
}
for (const preset of PRESETS) {
  if (preset.ids.length > BRIEF_LIMIT || new Set(preset.ids).size !== preset.ids.length || preset.ids.some((id) => !COMMANDS.some((command) => command.id === id))) throw new Error(`Invalid preset ${preset.id}`)
}

let revision = null
try {
  revision = execFileSync("git", ["log", "-1", "--format=%H", "--", ...paths], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null
} catch {
  // Source hashes still identify an exported source tree without .git metadata.
}
const source = { repository, revision, files: paths.map((path) => ({ path, sha256: createHash("sha256").update(contents.get(path)).digest("hex") })) }
const cross = COMMANDS.flatMap((agent) => codes.filter((code) => normalize(code.code) === normalize(agent.code)).map((code) => ({ agent, code })))
const agent = { schema_version: 1, book: "agent", source, composition_limit: BRIEF_LIMIT, groups: GROUPS, presets: PRESETS, entries: COMMANDS, cross_catalog_collisions: cross.map(({ agent, code }) => ({ id: agent.id, code: agent.code, meaning: agent.meaning, other_book: "codes", other_id: code.id, other_meaning: code.meaning })) }
const creative = { schema_version: 1, book: "codes", source, composition_limit: stackLimit, source_catalog_version: JSON.parse(contents.get("src/data/codes.json")).version, tasks, entries: codes, cross_catalog_collisions: cross.map(({ agent, code }) => ({ id: code.id, code: code.code, meaning: code.meaning, other_book: "agent", other_id: agent.id, other_meaning: agent.meaning })) }
const engine = await readFile(join(here, "catalog.py"), "utf8")
const output = new Map()
for (const [slug, catalog] of [["cuebook-agent-brief", agent], ["cuebook-creative-codes", creative]]) {
  const base = join(pluginRoot, "skills", slug)
  output.set(join(base, "scripts/catalog.py"), engine)
  output.set(join(base, "references/catalog.json"), JSON.stringify(catalog, null, 2) + "\n")
  for (const [name, text] of referenceFiles(catalog)) output.set(join(base, "references", name), text)
}
const changed = []
for (const [path, expected] of output) {
  let actual = null
  try { actual = await readFile(path, "utf8") } catch (error) { if (error.code !== "ENOENT") throw error }
  if (actual === expected) continue
  changed.push(path.slice(root.length + 1))
  if (!flags.has("--check")) {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, expected, "utf8")
  }
}
const report = { mode: flags.has("--check") ? "check" : "sync", valid: !flags.has("--check") || changed.length === 0, generated_files: output.size, changed_files: changed, agent_commands: COMMANDS.length, creative_codes: codes.length, cross_catalog_collisions: cross.length, source_revision: revision }
console.log(flags.has("--json") ? JSON.stringify(report, null, 2) : `${report.mode}: ${report.valid ? "ok" : "stale"}; ${output.size} files; ${changed.length} changed; ${COMMANDS.length} agent commands; ${codes.length} creative codes`)
if (!report.valid) process.exitCode = 1

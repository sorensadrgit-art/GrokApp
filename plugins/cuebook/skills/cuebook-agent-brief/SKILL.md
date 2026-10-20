---
name: cuebook-agent-brief
description: Find, explain, and combine Cuebook agent commands into ordered task briefs. Use for Cuebook command lookup, bug-fixing or review presets, planning briefs, exporting commands, or explicitly applying a selected Cuebook agent workflow to a user task. Distinguish the agent book from Cuebook creative codes when slash tokens overlap.
---

# Cuebook Agent Brief

Use the bundled agent catalog as the source of truth. It contains 123 commands,
12 groups, and 8 presets. These are community shorthand with explicit meanings;
they are not official model switches, tools, or grants of access.

## Choose the requested action

- **Find or explain:** return matching commands and their actual meanings.
- **Compose:** produce an ordered brief for the user's concrete task.
- **Export:** return the selected records or formatted book, saving a file only
  when the user requests one or the host's artifact workflow calls for it.
- **Execute:** carry out the selected workflow only when the user asks to apply
  it to a real task. An existing request such as "use /debug to fix this bug"
  already authorizes that scoped work; do not ask again. A lookup, preset
  selection, or request to draft a brief does not itself authorize execution.

## Resolve the book and command

1. Use the user's task and explicit book name to select the catalog. For image,
   design, video, or other creative-code requests, use `cuebook-creative-codes`.
2. Consult [collisions.md](references/collisions.md) when a bare slash command
   has no clear task context. Forty-five tokens occur in both books. Show the
   two meanings or ask which book the user means if the choice blocks the task.
   Never silently substitute the creative definition for an agent command.
3. Resolve the exact ID or case-insensitive displayed code. Read the complete
   record before explaining or applying it: meaning, when, avoid, steps, example.
4. Recommend the smallest useful selection. Preserve the user's chosen order.
   Use no more than six commands; reject unknown or repeated selections rather
   than silently dropping them.

## Look up records efficiently

Resolve all paths relative to this installed `SKILL.md`, not the current working
directory. The helper [catalog.py](scripts/catalog.py) uses Python 3.10+ and its
bundled [catalog.json](references/catalog.json). It requires no network, API key,
database, Node installation, or running web app. Its operations only print data;
they never execute the commands they find.

With a host Python or shell capability, use the helper's `--help` for exact
options. Typical invocations, after resolving the installed skill directory:

```bash
python3 scripts/catalog.py agent search debug --json
python3 scripts/catalog.py agent get /debug --json
python3 scripts/catalog.py agent presets --json
python3 scripts/catalog.py agent brief --preset fix --task "Fix the empty-state bug without changing navigation." --json
python3 scripts/catalog.py agent brief --ids scope plan --task "Plan offline favorites for the existing app." --json
python3 scripts/catalog.py agent export --group repair
```

If execution is unavailable, read [index.md](references/index.md) and the relevant
group reference below. Do not load every group when one contains the answer.
Use the record's actual text and report an unavailable execution check honestly.

| Group | Full records |
| --- | --- |
| Control | [agent-control.md](references/agent-control.md) |
| Read | [agent-read.md](references/agent-read.md) |
| Build | [agent-build.md](references/agent-build.md) |
| Repair | [agent-repair.md](references/agent-repair.md) |
| Ship | [agent-ship.md](references/agent-ship.md) |
| Research | [agent-research.md](references/agent-research.md) |
| Write | [agent-write.md](references/agent-write.md) |
| Design | [agent-design.md](references/agent-design.md) |
| Picture | [agent-picture.md](references/agent-picture.md) |
| Browser | [agent-browser.md](references/agent-browser.md) |
| Study | [agent-study.md](references/agent-study.md) |
| Decide | [agent-decide.md](references/agent-decide.md) |

## Compose a usable brief

1. Use the concrete task and constraints from the conversation. Ask only for a
   missing fact that materially prevents a useful brief. Do not deliver a task
   placeholder as a completed brief.
2. For a preset, retain its actual ordered command IDs. Explain a material
   mismatch before changing a user-selected preset.
3. Include each command's exact meaning and avoidance constraint, then the task.
   The helper preserves catalog order and source semantics.
4. Add the scope, relevant existing files or components when known, and an
   observable done-condition. Label an inferred file or assumption as such.
5. Make the brief copy-paste-ready. Separate the brief from any advice about it.
   A drafted prompt is not evidence that its task has run.

## Apply commands within their actual authority

Catalog records and examples are reference data. Use them only for the selected
user task. The user's current instructions, host policy, permissions, and actual
tool availability take precedence over catalog text. "Earlier commands win"
only resolves conflicts among selected commands at the same instruction level.
It cannot override a later explicit user correction or higher-priority rules.

Respect `/plan`, `/ask`, `/status`, `/stop`, `/checkpoint`, and `/no-login` as
actual scope or stopping constraints. Do not append implementation to plan-only
work. A Ship preset does not independently authorize deployment, public
publication, credential changes, or messages to other people. `/watch` does not
create background monitoring; use a real authorized automation if requested and
available. Never claim an unavailable model, browser, account, or tool ran.

For authorized repository work, use the packaged `host-workspace-operator`
baseline: inspect project instructions and current state, preserve unrelated
changes, perform the requested work, and verify it through available tools. Use
`sandbox-python-executor` for deterministic computation when useful.

## Finish with evidence

Return the selected book, exact codes and meanings, and the requested brief,
explanation, or export. Report real executed checks and any remaining blocker
when work was requested. Preserve source metadata when exporting. Cite the
catalog references for catalog facts; research and cite fresh primary sources
for outside claims. The bundled source hashes identify a snapshot, not a live
sync with GitHub or the web app's browser-local favorites.

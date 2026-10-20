# Cuebook

**Agent briefs and creative codes, available as a portable ChatGPT/Codex plugin.**

Cuebook brings the existing GrokApp catalogs into two focused skills:

| Skill | What it does |
| --- | --- |
| Cuebook Agent Brief | Find and explain 123 commands in 12 groups, use 8 presets, and compose up to 6 ordered commands into a task brief. |
| Cuebook Creative Codes | Search 963 codes across 7 tasks and combine up to 4 directions into a grounded prompt. |

Two supporting skills describe how to use the host's available workspace and
Python capabilities. They grant no tools, permissions, or external connections.

## Try it

- "Use Cuebook to build a bug-fixing brief for my project."
- "Find Cuebook codes for a cinematic luxury product image."
- "Explain /debug in both Cuebook catalogs and show how they differ."
- "Create a plan-only Cuebook brief for adding offline favorites."
- "Combine packshot and luxuryedition for my uploaded watch."

These are community shorthand, not official model commands or secret switches.
The plugin uses the meanings contained in its catalog. Forty-five slash tokens
appear in both books; Cuebook keeps their definitions separate.

## How it works

Each main skill contains a complete, self-contained catalog snapshot, readable
group references, and a standard-library Python helper. Python 3.10 or later is
needed for deterministic lookup and composition. When execution is unavailable,
the skill can read its Markdown index and full records instead.

Lookup, export, and composition print data and prompts. They do not run shell
commands from the catalog, contact a model, or modify your project. If you ask
the assistant to execute a selected workflow or generate media, it uses the
host's real available capabilities within that request's scope.

The package requires no API key, database, paid service, or running Cuebook web
server. Catalog snapshots do not synchronize with the web app's local favorites,
saved briefs, or stacks. Future catalog changes require rebuilding the package
and updating the saved plugin release.

## Package contents

- `plugin.json`: canonical portable Agent Plugins 1.0 manifest.
- `.codex-plugin/plugin.json`: synchronized compatibility manifest.
- `skills/`: two Cuebook workflows and two host-capability support policies.
- `assets/`: self-contained SVG logo variants and composer icon.

The open-book mark connects a slash command to readable directions. It keeps
Cuebook's charcoal, warm paper, and lime palette. The light and dark versions
share the same geometry; the small icon reduces detail for compact surfaces.

## Source and maintenance

Source repository: <https://github.com/sorensadrgit-art/GrokApp>.

Agent definitions come from `src/lib/agent-catalog.ts`. Creative records come
from `src/data/codes.json`, with taxonomy from `src/lib/catalog.ts`. Generated
catalog metadata preserves source paths, revisions, and SHA256 hashes. Source
labels from the original codebook are retained as supplied; they do not imply
that every external attribution was independently verified.

From the repository root, maintainers can run:

```bash
npm run plugin:sync
npm run plugin:check
npm run plugin:test
npm run plugin:pack
```

Development tools need Node 22.18+ or Node 24 and Python 3.10+. The installed
plugin does not need Node. The source web app, Grok-specific platform helpers,
browser state, dependencies, and build artifacts are excluded from the plugin
archive. See the repository's `PLUGIN.md` for the development workflow.

This package is prepared for private use. A valid archive or a created private
plugin does not mean it has been submitted to or approved for the public Plugin
Directory.

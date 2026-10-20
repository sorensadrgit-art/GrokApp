# Cuebook plugin

The portable plugin lives in [`plugins/cuebook`](plugins/cuebook). It packages the
existing application's agent-command and creative-codebook workflows. The web
application remains the source of catalog content.

## User workflows

1. **Find commands:** search the agent book or creative codebook with exact IDs,
   slash codes, or human descriptions.
2. **Build an agent brief:** choose up to six commands or one of eight existing
   presets, preserve their order, and provide a real task.
3. **Compose creative directions:** choose up to four creative codes and supply
   the subject or other task input.
4. **Explain or export:** inspect complete records with source labels or export
   a selected subset in Markdown or JSON.

`/debug`, `/decide`, and 43 other tokens occur in both books. The plugin never
silently combines their definitions. The included helpers explicitly use the
`agent` and `codes` namespaces and reject the wrong namespace for their dataset.
Spaced and punctuated display codes are treated as whole strings.

## Development

Use Node 22.18+ or Node 24, plus Python 3.10+. The plugin tooling is independent
of React and the web app's database/auth runtime; installing application
dependencies is unnecessary for the plugin checks.

| Command | Purpose |
| --- | --- |
| `npm run plugin:sync` | Rebuild catalog snapshots, readable references, helper copies, and the Codex compatibility manifest. |
| `npm run plugin:check` | Check that generated files match their sources and validate the portable package. |
| `npm run plugin:test` | Run catalog behavior, source-parity, and package-boundary tests. |
| `npm run plugin:pack` | Validate and create a deterministic ZIP under ignored `artifacts/`. |

Canonical maintenance code is under `plugin-tools/`. Generated helper copies
and catalog references live inside each main skill so each installed skill can
operate independently. Edit the canonical engine or the original app catalogs,
then run `plugin:sync`; do not patch generated copies by hand.

Catalog generation records source content hashes and the revision that last
changed the source files. It does not embed build timestamps or use unrelated
plugin commits to churn catalog content.

The canonical manifest is `plugins/cuebook/plugin.json`. Edit its identity and
OpenAI presentation metadata there. `plugin-tools/sync-manifest.py` derives the
compatibility overlay. Current OpenAI settings come from the root manifest's
`extensions.com.openai` object; the overlay is not merged into that object.

## Direct helper examples

From the repository root:

```bash
python3 plugins/cuebook/skills/cuebook-agent-brief/scripts/catalog.py agent get /debug --json
python3 plugins/cuebook/skills/cuebook-agent-brief/scripts/catalog.py agent presets --json
python3 plugins/cuebook/skills/cuebook-agent-brief/scripts/catalog.py agent brief --preset fix --task "Fix the empty-state bug." --json
python3 plugins/cuebook/skills/cuebook-creative-codes/scripts/catalog.py codes get "rim light" --json
python3 plugins/cuebook/skills/cuebook-creative-codes/scripts/catalog.py codes stack --ids packshot luxuryedition --subject "My uploaded watch" --json
```

All helper operations are read-only and print results. Use host file operations
to save an export. Neither helper executes a selected command, performs a model
call, grants access, writes browser state, or reads environment credentials.

## Verification and packaging

Checks cover source preservation, namespace separation, aliases, exact-match
ranking, selection order, preset expansion, bounds, duplicate and unknown IDs,
grounded composition, and deterministic archives. Package validation rejects
unsafe paths, symlinks, secrets-shaped files, active SVG content, missing
references, stale manifests, and unrelated application/runtime content.

`plugin:pack` writes a package containing only `plugins/cuebook`. Rebuilding from
identical source produces identical ZIP bytes. A release check should extract
the ZIP into a fresh directory, run the package validator there, and execute a
lookup, a brief, and a creative stack with Python alone.

The plugin does not change the web app's source, startup contract, authentication,
database, or deployment settings. Existing app build/test commands still belong
to the application's runtime and should be reported separately from plugin
validation.

## Creation and installation

Use Plugin Creator to create or update a **private** plugin from the validated
ZIP. After creation, verify its stored manifests and skill inventory. Creating
the plugin does not prove that a specific client has enabled it; select it in
that client's plugin picker and run a starter prompt to verify use there.

For Codex or desktop manual import, select the package directory or ZIP through
the client's supported plugin installation flow. Avoid manually writing client
credentials or permissions into the package.

The package currently declares no MCP server, remote endpoint, lifecycle hook,
or app view. Its jobs are catalog lookup, brief/prompt composition, and guiding
authorized host actions. Live favorites or cross-device synchronization would
require a separately implemented data service.

## Source boundaries

The catalogs are retained from this repository. Grok's `AGENTS.md`, auth and
preview plumbing, environment snapshots, and browser-local data are excluded
from the plugin archive. They describe the original app environment rather
than portable plugin capabilities.

The supporting host-workspace and Python policies originate from the installed
Plugin Autopilot 0.7.0 workflow. Their metadata keeps them explicit support
skills; they do not create host tools. This release makes no claim of public
directory approval or a verified publisher identity.

Format references: [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins)
and [OpenAI skill guidance](https://developers.openai.com/plugins/build/skills).

# Generated Workspaces

Each generated workspace lives under `instances/<slug>/`.

## Standard workspace tree

```text
instances/<slug>/
├── AGENTS.md
├── CLAUDE.md
├── AGENT_ENTRYPOINTS.md
├── PRODUCT.md
├── ROADMAP.md
├── manifest.json
├── .claude/
├── .cursor/
├── .github/
├── compliance/
├── integrations/
├── mcp/
├── memory/
├── prompts/
└── skills/generated/
```

## Core artifacts

### `AGENTS.md`

Product-scoped operating contract plus the repository-wide agent rules copied into the generated workspace.

### `CLAUDE.md`

Claude Code project memory that points the model at the workspace contract, repo-aware flow, and generated specialist surfaces.

### `AGENT_ENTRYPOINTS.md`

Cross-platform map of the root files and folders that flagship coding agents should load first.

### `PRODUCT.md`

Normalized product brief including:
- buyer
- problem
- workflow
- lane
- security posture
- repo/task context if provided

### `ROADMAP.md`

High-level delivery roadmap derived from the product brief.

### `manifest.json`

Primary UI-facing summary object. It includes:
- metadata
- subagents
- integrations
- file list
- risk posture
- metrics
- optional codebase analysis
- optional operator-thread messages

## Tool-native root artifacts

Every generated workspace is intended to be opened directly by coding-agent tools, not only imported through exports.

### `.claude/agents/*.md`

Native Claude Code subagents for both product specialists and repo slices. These files make the specialist roster directly callable without translating from generic markdown first.

### `.claude/commands/*.md`

Project commands for repo analysis, slice-agent refresh, and workspace bootstrap flows.

### `.cursor/rules/*.mdc`

Cursor project rules that mirror the same governance and specialist registry.

### `.github/copilot-instructions.md`

Repository-level Copilot guidance for planning and implementation behavior.

### `.github/prompts/*.prompt.md`

Reusable prompts for planning sessions inside Copilot-compatible environments.

## Repo-aware artifacts

If a repo path is provided:

### `CODEBASE_MAP.md`

Human-readable repository overview including:
- repo name and path
- files scanned
- detected frameworks and languages
- key files
- slice summaries

### `TASK_DISPATCH.md`

Module-specific task routing document that breaks the requested task into slice ownership boundaries.

### `memory/brain/resources/codebase-analysis.md`

Durable copy of the codebase overview inside the structured memory layer.

### `skills/generated/slices/*.md`

One markdown mini-agent per detected codebase slice.

These files are the core repo-aware artifact that downstream coding-agent tools can consume.

## Memory and planning artifacts

- `memory/executive-summary/`: system rules and current state
- `memory/timeline/`: daily note template
- `memory/brain/`: PARA structure for longer-lived knowledge
- `prompts/`: orchestrator prompt pack
- `mcp/`: execution-layer guidance
- `compliance/`: checklists for regulated or security-sensitive contexts

## Specialist artifacts

### Product-level specialists

Written to `skills/generated/*.md` and mirrored into `.claude/agents/*.md` for tool-native usage. These typically include:
- product architect
- frontend systems agent
- backend orchestrator
- security reviewer
- MCP operator
- domain specialist
- compliance officer when required

### Slice-level specialists

Written to `skills/generated/slices/*.md` when repo context exists and mirrored into `.claude/agents/*.md`.

These are task-scoped and path-bounded by module.

### `skills/generated/INDEX.md`

Registry of generated specialists across both product and repo-slice roles.

## Integration artifacts

The workspace also includes generated bundles under:
- `integrations/codex/`
- `integrations/claude/`
- `integrations/cursor/`
- `integrations/windsurf/`
- `integrations/github-copilot/`

## UI relationship

The frontend does not derive project state by recomputing generation logic.

Instead it:
1. loads project metadata from `manifest.json` via `/api/projects/:slug`
2. loads raw file text on demand via `/api/projects/:slug/file`

This makes the generated workspace the actual source of truth for what the UI displays.

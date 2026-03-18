# Generated Workspaces

Each generated workspace lives under `instances/<slug>/`.

## Standard workspace tree

```text
instances/<slug>/
├── AGENTS.md
├── PRODUCT.md
├── ROADMAP.md
├── manifest.json
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

Written to `skills/generated/*.md` and typically include:
- product architect
- frontend systems agent
- backend orchestrator
- security reviewer
- MCP operator
- domain specialist
- compliance officer when required

### Slice-level specialists

Written to `skills/generated/slices/*.md` when repo context exists.

These are task-scoped and path-bounded by module.

## Integration artifacts

The workspace also includes generated bundles under:
- `integrations/codex/`
- `integrations/cursor/`
- `integrations/windsurf/`
- `integrations/github-copilot/`

## UI relationship

The frontend does not derive project state by recomputing generation logic.

Instead it:
1. loads project metadata from `manifest.json` via `/api/projects/:slug`
2. loads raw file text on demand via `/api/projects/:slug/file`

This makes the generated workspace the actual source of truth for what the UI displays.

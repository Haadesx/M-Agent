# Generated Workspaces

Each generated workspace lives under `instances/<slug>/`.

## Core artifacts

- `AGENTS.md`: repo operating contract
- `PRODUCT.md`: product brief
- `ROADMAP.md`: high-level delivery plan
- `manifest.json`: UI-facing metadata for the workspace

## Repo-aware artifacts

If a repo path is provided:

- `CODEBASE_MAP.md`: repository overview, framework/language summary, slices
- `TASK_DISPATCH.md`: task routing by slice
- `skills/generated/slices/*.md`: markdown mini-agents for codebase slices

## Memory and planning artifacts

- `memory/`: executive summary, timeline template, and PARA brain structure
- `prompts/`: orchestrator prompt pack
- `mcp/`: execution-layer guidance
- `compliance/`: security/compliance checklists

## Specialist artifacts

- `skills/generated/*.md`: product-level specialists
- `skills/generated/slices/*.md`: repo-slice specialists
- `skills/generated/INDEX.md`: registry of generated specialists

## Integration artifacts

- `integrations/codex/`
- `integrations/cursor/`
- `integrations/windsurf/`
- `integrations/github-copilot/`

## UI relationship

The frontend does not compute workspace state from scratch. It reads the generated `manifest.json` and then resolves raw file content through `/api/projects/:slug/file`.

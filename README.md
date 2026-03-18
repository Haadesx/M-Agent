# Agent Systems Control Plane

This repository is a working local product for generating markdown-native agent systems.

It does a few things:
- accepts a product brief through a web interface
- accepts a local repository path plus a concrete implementation task
- maps the codebase into slices and generates markdown mini-agents per slice
- breaks both repo-backed and greenfield projects into smaller task agents
- generates a full markdown-native project workspace under `instances/`
- exports integration bundles for Codex, Claude Code, Cursor, Windsurf, and GitHub Copilot

It is also directly consumable as a repository by agentic coding tools:

- [AGENTS.md](./AGENTS.md) for Codex-style workflows
- [CLAUDE.md](./CLAUDE.md) plus `.claude/agents/` and `.claude/commands/` for Claude Code
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) for GitHub Copilot
- [.cursor/rules](./.cursor/rules) for Cursor
- [AGENT_ENTRYPOINTS.md](./AGENT_ENTRYPOINTS.md) as the cross-platform map

For deeper documentation, start with [docs/README.md](docs/README.md).

Concrete demos live in [examples/README.md](examples/README.md).
These are committed snapshots of real runs, not mocked screenshots or static concepts.

## What the product generates

Each workspace includes:
- `AGENTS.md`
- `CLAUDE.md`
- `AGENT_ENTRYPOINTS.md`
- `CODEBASE_MAP.md` when a repo path is provided
- `PRODUCT.md`
- `ROADMAP.md`
- `TASK_BREAKDOWN.md`
- `TASK_DISPATCH.md` when a repo path is provided
- `.claude/agents/*.md` and `.claude/commands/*.md`
- `.claude/agents/*.md` includes product specialists, task agents, and repo-slice specialists for Claude Code
- `skills/generated/tasks/*.md` task agents for greenfield and repo-backed work
- `.cursor/rules/*.mdc`
- `.github/copilot-instructions.md` and `.github/prompts/*.prompt.md`
- `memory/` scaffolding
- `skills/generated/*.md` product-specific sub-agents
- `skills/generated/slices/*.md` codebase slice agents when a repo path is provided
- `mcp/` execution-layer guidance
- `compliance/` templates
- `integrations/` bundles for supported coding-agent tools
- `manifest.json` for UI/API rendering

## Run the product

```bash
npm start
```

Then open:

- [http://127.0.0.1:4173](http://127.0.0.1:4173)

## Test

```bash
npm test
```

This runs:
- Node tests for the generator and file outputs
- Python tests for the original bootstrap script

## API

- `GET /api/health`
- `POST /api/analyze`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:slug`
- `GET /api/projects/:slug/file?path=...`

## Notes on tool integrations

The app generates tool-specific instruction bundles under each workspace:
- `integrations/codex/`
- `integrations/claude/`
- `integrations/cursor/`
- `integrations/windsurf/`
- `integrations/github-copilot/`

Each generated workspace is also directly consumable at the repo root through `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.cursor/`, and `.github/`, so flagship coding agents can operate on it without a separate import step.

## Demo Scenarios

- Existing repo demo: [examples/vite-repo-demo/README.md](examples/vite-repo-demo/README.md)
- Greenfield demo: [examples/greenfield-demo/README.md](examples/greenfield-demo/README.md)

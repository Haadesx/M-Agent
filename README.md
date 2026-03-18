# Agent Systems Control Plane

This repository is a working local product for generating markdown-native agent systems.

It does four things:
- accepts a product brief through a web interface
- accepts a local repository path plus a concrete implementation task
- maps the codebase into slices and generates markdown mini-agents per slice
- generates a full markdown-native project workspace under `instances/`
- exports integration bundles for Codex, Cursor, Windsurf, and GitHub Copilot

For deeper documentation, start with [docs/README.md](docs/README.md).

## What the product generates

Each workspace includes:
- `AGENTS.md`
- `CODEBASE_MAP.md` when a repo path is provided
- `PRODUCT.md`
- `ROADMAP.md`
- `TASK_DISPATCH.md` when a repo path is provided
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
- `integrations/cursor/`
- `integrations/windsurf/`
- `integrations/github-copilot/`

These bundles are intended to be imported or copied into the target tool workspace, with exact formats chosen to match the current official guidance where available.

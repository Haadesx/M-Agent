# Agent Systems Control Plane

Agent Systems Control Plane is a local-first product for turning a product brief, repository path, and implementation task into a markdown-native agent workspace.

The current version is designed to solve four concrete problems:
- capture operator intent through a single control-room UI
- analyze a local codebase and break it into task-oriented slices
- generate product-level and slice-level markdown agents
- export tool-specific instruction packs for major coding-agent environments

For deeper documentation, start with [docs/README.md](docs/README.md).

## Core capabilities

### 1. Operator thread

The frontend accepts:
- product name
- primary buyer
- problem statement
- workflow description
- local repository path
- requested implementation task
- extra context

The UI can analyze the repo before generation and then render the breakdown as an assistant-style operator thread.

### 2. Repo-aware decomposition

The backend scans a local repository, infers languages/frameworks, identifies likely module roots, classifies slices by type, and assigns a recommended mini-agent per slice.

### 3. Workspace generation

Each generated workspace is written to `instances/<slug>/` and includes:
- `AGENTS.md`
- `PRODUCT.md`
- `ROADMAP.md`
- `manifest.json`
- `memory/`
- `mcp/`
- `compliance/`
- `prompts/`
- `skills/generated/*.md`

If a repo path is provided, the workspace also includes:
- `CODEBASE_MAP.md`
- `TASK_DISPATCH.md`
- `skills/generated/slices/*.md`

### 4. Tool integration bundles

Each workspace includes export packs for:
- Codex
- Cursor
- Windsurf
- GitHub Copilot

These are generated as import-ready files, not as remote API installations.

## Repository layout

```text
.
├── index.html
├── app.js
├── styles.css
├── server.js
├── lib/
│   ├── codebase.js
│   └── generator.js
├── compliance/
├── mcp/
├── memory/
├── prompts/
├── scripts/
├── skills/
├── templates/
└── tests/
```

## Quick start

### Run locally

```bash
npm start
```

Open:

- [http://127.0.0.1:4173](http://127.0.0.1:4173)

### Run tests

```bash
npm test
```

This runs:
- Node tests for repo analysis and workspace generation
- Python tests for the original bootstrap helper

## API surface

- `GET /api/health`
- `POST /api/analyze`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:slug`
- `GET /api/projects/:slug/file?path=...`

Detailed request/response behavior is documented in [docs/api.md](docs/api.md).

## Initial deployment posture

The current deployment model is intentionally simple:
- one Node process
- static frontend served by the same process
- local writable filesystem for generated workspaces

That keeps the product easy to inspect and run, but it also means this is not yet a multi-tenant hosted SaaS. See [docs/operations.md](docs/operations.md) and [docs/limitations.md](docs/limitations.md) for the production gaps.

## Documentation map

- [docs/architecture.md](docs/architecture.md): runtime structure and execution flow
- [docs/api.md](docs/api.md): HTTP routes and payloads
- [docs/repo-analysis.md](docs/repo-analysis.md): codebase scanning and slice inference
- [docs/generated-workspaces.md](docs/generated-workspaces.md): generated files and what they mean
- [docs/tool-integrations.md](docs/tool-integrations.md): exported bundles for coding-agent tools
- [docs/operations.md](docs/operations.md): local run, test, and deployment guidance
- [docs/limitations.md](docs/limitations.md): current constraints and known gaps

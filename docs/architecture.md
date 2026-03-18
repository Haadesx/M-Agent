# Architecture

## Runtime shape

The product is a local-first web application with one static frontend and one minimal Node backend.

### Frontend

- [index.html](../index.html): application shell
- [app.js](../app.js): client-side state, API calls, tab rendering, and operator-thread updates
- [styles.css](../styles.css): UI styling for the control-room layout

### Backend

- [server.js](../server.js): HTTP routing, request validation, static file serving
- [lib/codebase.js](../lib/codebase.js): repo scan, language/framework hints, slice detection, task dispatch heuristics
- [lib/generator.js](../lib/generator.js): project generation, markdown artifact writing, manifest creation, integration bundle export

## System model

The repository follows the two-layer architecture described in the project instructions:

### Knowledge layer

This is everything that is generated for agent reasoning and review:
- `AGENTS.md`
- `PRODUCT.md`
- `ROADMAP.md`
- `CODEBASE_MAP.md`
- `TASK_DISPATCH.md`
- `memory/`
- `skills/generated/*.md`
- `skills/generated/slices/*.md`
- tool export rules and prompts

### Execution layer

This is the live application behavior:
- local HTTP API
- filesystem reads and writes
- repo scanning
- manifest loading
- UI file preview requests

The current implementation deliberately keeps execution thin and pushes persistent guidance into markdown artifacts.

## Request lifecycle

### Analysis flow

1. The operator enters the brief, repository path, task, and context.
2. The frontend calls `POST /api/analyze`.
3. `server.js` validates the request and passes it to `analyzeCodebase`.
4. `lib/codebase.js` scans the repo, infers frameworks, identifies module roots, classifies slice kinds, and builds task-specific slice summaries.
5. The API returns a structured analysis object with chat messages, module slices, frameworks, and languages.
6. The frontend renders that analysis in the operator thread and decomposition panels.

### Generation flow

1. The operator submits the same brief to `POST /api/projects`.
2. `server.js` validates the request and passes it to `createProject`.
3. `lib/generator.js` creates a workspace under `instances/<slug>/`.
4. Shared scaffolding is copied in.
5. Product-level specialists are generated.
6. If repo context exists, slice-level agents and repo analysis docs are generated.
7. Tool-specific integration bundles are written.
8. `manifest.json` is written and becomes the UI-facing summary for that workspace.
9. The frontend loads the workspace through `GET /api/projects/:slug` and reads specific files via `GET /api/projects/:slug/file`.

## Persistence model

There is no database in the current version.

- Source of truth: local filesystem
- Generated workspaces: `instances/<slug>/`
- UI metadata: `manifest.json` inside each workspace
- Static application assets: repository root

This makes the system easy to inspect and debug, but it also means durability, multi-user coordination, and hosted deployment are not yet solved.

## Design tradeoffs

### Benefits

- very low setup overhead
- all generated artifacts are inspectable
- markdown outputs are easy to import into coding-agent tools
- no hidden orchestration layer or opaque storage dependency

### Costs

- local-disk persistence only
- no background job model
- request latency scales with synchronous filesystem work
- repo analysis quality is bounded by heuristics

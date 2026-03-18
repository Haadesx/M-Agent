# Architecture

## Runtime shape

The product is a local-first web application with a static frontend and a minimal Node HTTP backend.

- Frontend: [index.html](../index.html), [app.js](../app.js), [styles.css](../styles.css)
- Server: [server.js](../server.js)
- Repo analysis: [lib/codebase.js](../lib/codebase.js)
- Workspace generation: [lib/generator.js](../lib/generator.js)

## System model

The product follows a two-layer architecture:

- Knowledge layer: markdown artifacts such as `AGENTS.md`, roadmap files, memory files, slice-agent instructions, and integration exports.
- Execution layer: the local HTTP API plus filesystem writes that generate workspaces and serve their contents.

## Request lifecycle

1. The user enters a product brief, repo path, task, and optional context.
2. The frontend can call `POST /api/analyze` to map the repo into slices.
3. The backend scans the repo, infers languages/frameworks, and proposes slice agents plus task dispatch boundaries.
4. The frontend renders the analysis as an operator thread and decomposition view.
5. The user calls `POST /api/projects` to generate a workspace.
6. The generator writes artifacts under `instances/<slug>/`.
7. The frontend reads `manifest.json`-backed data through the API and lets the user inspect files, slice agents, and integration bundles.

## Persistence model

- Source of truth: the local filesystem.
- Generated workspaces: `instances/<slug>/`
- Generated project metadata: `manifest.json` inside each instance
- There is no database, queue, or external storage layer in the current version.

## Why this shape

This architecture keeps the product easy to run and inspect while still proving the core behavior:

- repo-aware decomposition
- markdown mini-agent generation
- export packs for coding-agent tools
- file-based artifact inspection in the UI

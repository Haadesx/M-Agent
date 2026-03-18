# Repo Analysis

## Purpose

The repo analysis layer converts a local codebase plus a requested task into:

- a repository summary
- framework and language hints
- codebase slices
- a recommended markdown mini-agent per slice
- module-specific task assignments
- assistant-style analysis messages for the UI

Implementation lives in [lib/codebase.js](../lib/codebase.js).

## Scan behavior

### Directory walk

- recursive file walk
- maximum depth: `6`
- maximum files: `1500`

### Ignored directories

The scanner skips common local noise and build output, including:
- `.git`
- `node_modules`
- `dist`
- `build`
- `coverage`
- `.next`
- `.nuxt`
- `.cache`
- `.turbo`
- `vendor`
- `tmp`
- `output`
- `.playwright-cli`

## What gets inferred

### Languages

Language counts are inferred from file extensions via a static map in `CODE_EXTENSIONS`.

This is intentionally cheap and deterministic. It does not parse code.

### Frameworks

Framework hints come from common manifests:
- `package.json`
- `pyproject.toml`
- `requirements.txt`
- `go.mod`
- `Cargo.toml`

Current Node-specific framework hints include:
- Next.js
- React
- Node API
- Vite

### Candidate module roots

The analyzer tries to avoid treating every file as its own slice. It prefers likely package roots in this order:

1. `apps/`
2. `packages/`
3. `services/`
4. `src/`
5. fallback to top-level directories

### Module kinds

Each candidate slice is heuristically classified as one of:
- frontend
- backend
- security
- data
- infrastructure
- quality
- shared
- domain

That classification is based on directory names and file paths, not semantic code understanding.

### Recommended agents

Each module kind maps to a recommended agent name such as:
- `Frontend Slice Agent`
- `Backend Slice Agent`
- `Security Slice Agent`
- `Shared Systems Agent`
- `Domain Slice Agent`

## Per-slice output

Every detected slice gets:
- `id`
- `title`
- `path`
- `kind`
- `fileCount`
- `primaryLanguage`
- `sampleFiles`
- `recommendedAgent`
- `taskSlice`
- `summary`

`taskSlice` is the key bridge from repository structure to markdown-agent generation. It converts the user’s task into a bounded ownership statement for that slice.

## UI-facing message layer

The analysis object also includes `messages`, which are rendered in the operator thread. These messages currently include:
- task request
- codebase summary
- dispatch proposal

This allows the UI to look and behave like a control-room thread instead of a plain form submission interface.

## Current limits

- no semantic dependency graph
- no symbol-level ownership mapping
- no import graph tracing
- no test coverage inference
- no remote clone/fetch path
- no LLM-based reasoning over source text

The current system is a fast heuristic mapper intended to generate useful first-pass boundaries, not a complete architectural analyzer.

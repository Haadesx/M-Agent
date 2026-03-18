# Repo Analysis

## Purpose

The repo analysis layer converts a local codebase plus a task into:

- a repository summary
- framework/language hints
- codebase slices
- recommended slice agents
- module-specific task assignments
- assistant-style analysis messages for the UI

## Implementation

Repo analysis lives in [lib/codebase.js](../lib/codebase.js).

## Scan behavior

- Recursive file walk
- Depth limit: 6
- File cap: 1500
- Ignored directories include `.git`, `node_modules`, build artifacts, caches, and local tooling output

## What gets inferred

### Languages

Language counts are inferred from file extensions using a static map.

### Frameworks

Framework hints are inferred from common manifests such as:

- `package.json`
- `pyproject.toml`
- `requirements.txt`
- `go.mod`
- `Cargo.toml`

### Candidate module roots

The analyzer prefers these roots in order:

1. `apps/`
2. `packages/`
3. `services/`
4. `src/`
5. fallback to top-level directories

### Module kinds

Kinds are inferred heuristically from names and file paths:

- frontend
- backend
- security
- data
- infrastructure
- quality
- shared
- domain

Each module gets:

- `path`
- `kind`
- `fileCount`
- `primaryLanguage`
- `sampleFiles`
- `recommendedAgent`
- `taskSlice`
- `summary`

## Output model

The analysis object also contains:

- `messages`: assistant-style summaries for the chat UI
- `keyFiles`: likely entrypoint/config files
- `moduleCount`
- `fileCount`

## Known heuristic limits

- It does not do semantic understanding of code internals.
- It can over-index on directory names when a repo is mostly documentation.
- It does not infer dependency graphs between modules.
- It does not clone or fetch remote repos; the path must exist locally.

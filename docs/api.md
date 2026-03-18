# API

## `GET /api/health`

Health check for the local service.

Response:

```json
{ "ok": true }
```

## `POST /api/analyze`

Analyze a local repo path and produce codebase slices without generating a workspace.

Required body fields:

- `productName`
- `customer`
- `problem`
- `workflow`
- `repoPath`

Optional body fields:

- `task`
- `contextNotes`
- `productLane`
- `riskLevel`
- `priority`
- `interfaceMode`

Response:

- `analysis.repoPath`
- `analysis.repoName`
- `analysis.fileCount`
- `analysis.moduleCount`
- `analysis.frameworks`
- `analysis.languages`
- `analysis.keyFiles`
- `analysis.modules`
- `analysis.messages`

## `GET /api/projects`

List generated workspaces discovered from `instances/*/manifest.json`.

Each item includes:

- `slug`
- `productName`
- `customer`
- `riskLabel`
- `createdAt`
- `subagentCount`
- `integrationCount`
- `moduleCount`
- `repoPath`
- `workspacePath`

## `POST /api/projects`

Generate a new workspace from the provided brief. Uses the same request shape as `POST /api/analyze`.

If `repoPath` is present, the generated workspace also includes:

- `CODEBASE_MAP.md`
- `TASK_DISPATCH.md`
- `skills/generated/slices/*.md`
- repo-aware tool exports

## `GET /api/projects/:slug`

Return the parsed `manifest.json` for one workspace.

## `GET /api/projects/:slug/file?path=...`

Read a single generated file from the workspace. The path is normalized and rejected if it escapes the workspace root.

## Validation and errors

Validation happens in `validateProjectInput` inside [server.js](../server.js).

Common error cases:

- missing required brief fields
- missing `repoPath` for `/api/analyze`
- invalid file path for workspace reads
- nonexistent local repo path
- generic server failures while reading or writing the filesystem

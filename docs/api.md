# API

The backend is implemented in [server.js](../server.js) as a minimal HTTP server. All state is derived from local filesystem reads and writes.

## Request body shape

Both `POST /api/analyze` and `POST /api/projects` accept the same logical input model.

### Required fields

- `productName`
- `customer`
- `problem`
- `workflow`

### Optional fields

- `repoPath`
- `task`
- `contextNotes`
- `productLane`
- `riskLevel`
- `priority`
- `interfaceMode`

Validation is centralized in `validateProjectInput` inside [server.js](../server.js).

## `GET /api/health`

Health check for the local service.

### Response

```json
{ "ok": true }
```

## `POST /api/analyze`

Analyze a local repo path and return a decomposition object without writing a workspace.

### Additional requirement

- `repoPath` must be present and must point to an existing local directory

### Response shape

```json
{
  "analysis": {
    "repoPath": "/abs/path",
    "repoName": "my-repo",
    "task": "Implement X.",
    "contextNotes": "Extra context.",
    "fileCount": 120,
    "moduleCount": 5,
    "frameworks": ["React", "Node API"],
    "languages": [{ "language": "TypeScript", "count": 80 }],
    "keyFiles": ["package.json", "README.md"],
    "modules": [
      {
        "id": "src-ui",
        "title": "Src / Ui",
        "path": "src/ui",
        "kind": "frontend",
        "fileCount": 25,
        "primaryLanguage": "TypeScript",
        "sampleFiles": ["src/ui/App.tsx"],
        "recommendedAgent": "Frontend Slice Agent",
        "taskSlice": "Own the frontend work required for...",
        "summary": "src/ui looks like..."
      }
    ],
    "messages": [
      {
        "role": "assistant",
        "title": "Codebase summary",
        "content": "Mapped ..."
      }
    ]
  }
}
```

## `GET /api/projects`

List generated workspaces discovered from `instances/*/manifest.json`.

### Response shape

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

Generate a new workspace from the provided brief.

### Behavior

- Creates `instances/<slug>/`
- Copies shared scaffolding
- Generates product-level markdown agents
- Writes root-level tool entrypoints for Codex, Claude Code, Cursor, and Copilot
- If `repoPath` is present, runs repo analysis and generates codebase-aware artifacts
- Writes `manifest.json`

### Repo-aware additions

If `repoPath` is present, the workspace also includes:
- `CODEBASE_MAP.md`
- `TASK_DISPATCH.md`
- `memory/brain/resources/codebase-analysis.md`
- `skills/generated/slices/*.md`
- `.claude/agents/*.md` for repo slices
- repo-aware Claude Code, Cursor, Copilot, Windsurf, and Codex exports

### Response

Returns the parsed manifest for the generated project:

```json
{
  "project": {
    "slug": "example-project",
    "workspacePath": ".../instances/example-project",
    "productName": "Example Project",
    "subagents": [],
    "integrations": [],
    "files": [],
    "metrics": {
      "subagentCount": 0,
      "integrationCount": 0,
      "fileCount": 0,
      "moduleCount": 0
    }
  }
}
```

## `GET /api/projects/:slug`

Return one generated workspace by loading `instances/:slug/manifest.json`.

This is the primary UI read path for project overview data.

## `GET /api/projects/:slug/file?path=...`

Read one generated file from inside a workspace.

### Path handling

- the path is normalized
- escaping the workspace root is rejected
- the file is returned as plain text inside JSON

### Response

```json
{
  "file": {
    "path": "AGENTS.md",
    "content": "# Product Scope: ..."
  }
}
```

## Common error cases

- missing required brief fields
- missing `repoPath` for `/api/analyze`
- invalid or nonexistent repo path
- invalid workspace file path
- missing generated workspace slug
- generic filesystem failures during generation

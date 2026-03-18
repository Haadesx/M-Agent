# Limitations

## Analysis limits

- Repo decomposition is heuristic, not model-backed semantic analysis.
- Slice detection relies heavily on directory names and file paths.
- There is no dependency graph reconstruction or symbol-level ownership model.
- Documentation-heavy repos can skew language and module detection.

## Input limits

- Only local filesystem repo paths are supported.
- There is no built-in GitHub clone flow or remote import pipeline.
- The app assumes the process can read the provided path directly.

## Runtime limits

- There is no database; the filesystem is the only persistence layer.
- There is no queue, scheduler, or background worker model.
- Large repo scans may need asynchronous handling in a future version.
- The current HTTP server is minimal and not optimized for high concurrency.

## Security and product limits

- There is no auth, RBAC, or multi-user isolation.
- There is no tenant-aware storage segmentation.
- There is no secret-management workflow beyond the project’s markdown-first guardrails.
- Generated exports do not automatically verify downstream tool compatibility.

## Integration limits

- Tool integration bundles are generated files and guidance, not remote installations.
- Future changes in Codex, Cursor, Windsurf, or Copilot file conventions may require generator updates.
- The app does not currently round-trip changes from external tools back into the control plane.

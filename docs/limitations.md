# Limitations

- Repo decomposition is heuristic, not model-backed semantic analysis.
- Only local filesystem repo paths are supported.
- There is no built-in GitHub clone/authentication flow.
- There is no database; the filesystem is the only persistence layer.
- There is no RBAC, auth, or multi-user isolation.
- Large repos may need a job queue or streaming analysis flow in a future version.
- Tool integration bundles are generated files and guidance, not guaranteed zero-click installs across all future tool versions.

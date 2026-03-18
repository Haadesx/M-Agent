# Operations

## Run locally

```bash
npm start
```

Default port:

- `4173`

Open:

- `http://127.0.0.1:4173`

## Runtime requirements

- Node.js with support for the built-in `node:test` runner
- writable local filesystem access
- permission to read any repo path you want to analyze

## Test

```bash
npm test
```

This runs:

- Node tests for repo analysis and workspace generation
- Python tests for the original bootstrap helper

## Local data behavior

Generated workspaces are written under:

- `instances/`

Local development artifacts that should remain untracked include:

- `.playwright-cli/`
- `output/`
- `instances/`
- `coverage/`

## Deployment shape today

The current product is a simple Node process with filesystem persistence. A deployment target needs:

- writable local or mounted storage for `instances/`
- a long-running Node process
- a reverse proxy if exposed externally

## Suggested initial deployment model

For a basic hosted deployment, use:
- one container or VM
- persistent volume mounted for `instances/`
- reverse proxy or managed HTTP edge
- process restart policy

This is sufficient for demos, internal usage, or a single-tenant deployment.

## What a production deployment still needs

- authentication
- user/session management
- multi-tenant storage isolation
- durable external persistence or backups
- job handling for large repo scans
- secrets handling for future remote integrations

## Operational risks

- synchronous filesystem-heavy requests can block the process for large repos
- repo analysis does not currently stream progress
- workspaces can accumulate without retention or archival policies
- generated outputs inherit the permissions of the host process

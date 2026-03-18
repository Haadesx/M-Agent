# Operations

## Run locally

```bash
npm start
```

Default port:

- `4173`

Open:

- `http://127.0.0.1:4173`

## Test

```bash
npm test
```

This runs:

- Node tests for repo analysis and workspace generation
- Python tests for the original bootstrap helper

## Deployment shape today

The current product is a simple Node process with filesystem persistence. A deployment target needs:

- writable local or mounted storage for `instances/`
- a long-running Node process
- a reverse proxy if exposed externally

## What a production deployment still needs

- authentication
- user/session management
- multi-tenant storage isolation
- durable external persistence or backups
- job handling for large repo scans
- secrets handling for future remote integrations

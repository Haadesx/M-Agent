# Task Breakdown

## Repo-aware mode

These tasks were grounded in repository slices and sample files.

## Tasks

1. Lock Scope and Slice Boundaries
   - Owner: Product Architect
   - Summary: Reduce the requested repo task to the smallest approved change set, confirm which slices are actually in scope, and record what should stay untouched.
   - Outputs: Approved scope note, Out-of-scope list, Cross-slice escalation note if needed
   - Targets: `PRODUCT.md`, `ROADMAP.md`, `CODEBASE_MAP.md`, `TASK_DISPATCH.md`

2. Execute Packages / Create-vite
   - Owner: Frontend Slice Agent: Packages / Create-vite
   - Summary: Own the `packages/create-vite` part of the task only if scaffold or template behavior is actually implicated.
   - Outputs: Patch plan for `packages/create-vite`, concrete files to edit, handoff note if another slice or docs path is required
   - Targets: `packages/create-vite/README.md`, `packages/create-vite/__tests__/cli.spec.ts`, `packages/create-vite/index.js`

3. Execute Packages / Plugin-legacy
   - Owner: Infrastructure Slice Agent: Packages / Plugin-legacy
   - Summary: Confirm whether the task touches legacy-plugin behavior or whether this slice should remain unchanged.
   - Outputs: Patch plan or no-op confirmation, concrete files to edit, handoff note if another slice or docs path is required
   - Targets: `packages/plugin-legacy/README.md`, `packages/plugin-legacy/package.json`, `packages/plugin-legacy/src/__tests__/readme.spec.ts`

4. Execute Packages / Vite
   - Owner: Frontend Slice Agent: Packages / Vite
   - Summary: Own the main runtime work for the `strictPort` startup note and any adjacent Vite-package changes.
   - Outputs: Patch plan for `packages/vite`, concrete files to edit, handoff note if docs or playground paths are required
   - Targets: `packages/vite/src/node/http.ts`, `packages/vite/src/node/server/index.ts`, `packages/vite/src/node/cli.ts`, `packages/vite/src/node/logger.ts`

5. Verify and Close Out
   - Owner: Developer Productivity Specialist
   - Summary: Define the narrowest regression checks, review checkpoints, and release notes required after slice work lands.
   - Outputs: Verification checklist, test focus list, review summary and rollout note
   - Targets: `packages/vite/src/node/__tests__/http.spec.ts`, `packages/vite/src/node/__tests__/dev.spec.ts`, `docs/config/server-options.md`

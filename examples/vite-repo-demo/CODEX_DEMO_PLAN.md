# Codex Demo Plan

Codex consumed the same generated workspace and converged on a similar plan:

## Minimum Viable Change Set

1. Emit one clear startup note when the dev server runs with `server.strictPort: true`.
2. Place the note in the startup path users already read.
3. Update docs to explain the behavior.
4. Add or point to a runnable playground example.
5. Cover the behavior with focused tests.

## Task Assignment

| Subtask | Generated agent | Likely target files |
| --- | --- | --- |
| Lock exact success criteria | `product-architect` | `PRODUCT.md`, `ROADMAP.md`, `TASK_BREAKDOWN.md` |
| Choose the primary emission point | `task-packages-vite` | `packages/vite/src/node/http.ts`, `packages/vite/src/node/server/index.ts`, `packages/vite/src/node/cli.ts`, `packages/vite/src/node/logger.ts` |
| Define final user-visible copy | `frontend-systems` | `packages/vite/src/node/cli.ts`, `packages/vite/src/node/logger.ts`, `docs/config/server-options.md` |
| Add focused tests | `task-verify-closeout` | `packages/vite/src/node/__tests__/http.spec.ts`, `packages/vite/src/node/__tests__/dev.spec.ts` |
| Add or select a runnable example | `task-packages-vite` | `playground/assets/vite.config-url-base.js`, `playground/test-utils.ts`, inferred new playground path |
| Review scope drift | `security-reviewer` | review only across touched files |

## Outcome

Codex used the generated task map and agent files as a starting structure, then grounded its plan in the actual Vite runtime and docs files. The important point is not the exact wording of the plan, but that the repo contract gave Codex a ready-made decomposition layer.

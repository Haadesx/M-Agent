# Claude Demo Plan

Claude Code consumed the generated workspace and produced a plan like this:

## Subtasks

1. Add the startup log
   - Agent: `task-packages-vite`
   - Target files:
     - `packages/vite/src/node/http.ts`
     - `packages/vite/src/node/server/index.ts`
   - Goal: emit a visible startup note when `strictPort` is enabled before the port-binding loop proceeds

2. Add or select a playground example
   - Agent: `task-packages-vite`
   - Target files:
     - `playground/strict-port/`
     - `playground/assets/vite.config-url-base.js`
   - Goal: make the behavior easy to reproduce for maintainers

3. Update docs
   - Agent: `task-packages-vite`
   - Target files:
     - `docs/config/server-options.md`
     - `docs/guide/cli.md`
   - Goal: explain what the new startup note means and when users should expect it

4. Verify runtime behavior
   - Agent: `task-verify-closeout`
   - Target files:
     - `packages/vite/src/node/__tests__/http.spec.ts`
     - `packages/vite/src/node/__tests__/dev.spec.ts`
   - Goal: keep the verification path small and explicit

5. Run no-op scope checks
   - Agents:
     - `task-packages-create-vite`
     - `task-packages-plugin-legacy`
   - Goal: confirm those slices stay untouched unless implementation proves otherwise

## Outcome

Claude treated the generated markdown as the planning contract, not as optional context. It stayed in Phase 0, named concrete files, and assigned the work to generated agents instead of improvising a fresh structure.

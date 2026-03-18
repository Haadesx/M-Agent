# Vite Repo Demo

This example shows the product pointed at `vitejs/vite` with the task:

> Add a startup log note when `strictPort` is enabled, and document it with a playground example.

## What the product generated

- [TASK_BREAKDOWN.md](./TASK_BREAKDOWN.md): smaller execution tasks derived from the repo analysis
- [task-packages-vite.md](./task-packages-vite.md): native task agent for the main runtime slice
- [CLAUDE_DEMO_PLAN.md](./CLAUDE_DEMO_PLAN.md): plan file written by Claude Code using the generated workspace
- [CODEX_DEMO_PLAN.md](./CODEX_DEMO_PLAN.md): plan file written by Codex using the same generated workspace

## What this demonstrates

- the repo is decomposed before implementation starts
- slice ownership becomes explicit
- a flagship model can read the generated markdown and turn it into an execution plan with little extra prompting
- the work can stay in Phase 0 planning until a human approves implementation

## Important boundary

This demo does not include a patch to the Vite repo. It is a planning and delegation example only.

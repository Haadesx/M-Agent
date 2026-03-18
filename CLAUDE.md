# Claude Project Memory

See @AGENTS.md for the core operating contract and @README.md for the product overview.

## Primary Purpose

- This repository is an agent systems control plane.
- It can analyze an existing repository, break it into slices, and generate markdown mini-agents.
- It can also scaffold a new project workspace from a structured brief.

## Working Rules

- Always start by reading the repo context before proposing implementation.
- If the user provides a local repo path, map the codebase into slices before making a plan.
- Keep durable guidance in markdown files and treat generated workspaces as filesystem artifacts.
- Prefer using the project subagents in `.claude/agents/` when the task clearly matches one of them.
- Use the project slash commands in `.claude/commands/` to standardize analysis and workspace generation flows.

## Key Files

- `server.js`: local HTTP API
- `lib/codebase.js`: repository mapper and slice detection
- `lib/generator.js`: workspace and integration artifact generator
- `docs/repo-analysis.md`: decomposition logic
- `docs/tool-integrations.md`: platform support

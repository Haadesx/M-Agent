# Repository Custom Instructions

- This repository is an agent systems control plane for building or analyzing software projects.
- If the task includes a local repo path, analyze that codebase before proposing implementation.
- Break existing codebases into narrow slices and define mini-agents per slice.
- Keep durable instructions in markdown artifacts and generated workspace files.
- Prefer file-based outputs the user can import into Codex, Claude Code, Cursor, Windsurf, and GitHub Copilot workflows.
- When generating tasks, preserve explicit boundaries: slice path, task objective, escalation conditions, and output files.

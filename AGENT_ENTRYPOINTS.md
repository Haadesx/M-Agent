# Agent Entry Points

This repository is designed to be directly usable by multiple coding-agent platforms even without the web UI.

## Primary Files

- `AGENTS.md`: core repo contract for Codex-style workflows
- `CLAUDE.md`: project memory for Claude Code
- `.claude/agents/`: Claude Code project subagents
- `.claude/commands/`: Claude Code project slash commands
- `.github/copilot-instructions.md`: repository-wide Copilot instructions
- `.github/prompts/*.prompt.md`: reusable Copilot prompts
- `.cursor/rules/*.mdc`: Cursor project rules

## Intended Flow

1. Load the repo-level guidance file for the platform.
2. If the task references a repo path, analyze it first.
3. Break the codebase into slices.
4. Create or refine markdown mini-agents for those slices.
5. Let the flagship model orchestrate using those generated artifacts.

## What This Enables

- building a project from scratch with a strong repo contract
- analyzing an existing repository with low prompt overhead
- generating subagents that can be reused across sessions and tools

# Tool Integrations

The generator supports two delivery modes:

- root-level repo entrypoints so a generated workspace can be opened directly in an agentic coding tool
- `integrations/` bundles when a team wants exportable platform-specific packs

## Root-level direct consumption

Each generated workspace can be used directly by flagship coding tools from the repository root.

Path:

- `AGENTS.md`
- `CLAUDE.md`
- `AGENT_ENTRYPOINTS.md`
- `.claude/agents/*.md`
- `.claude/commands/*.md`
- `.cursor/rules/*.mdc`
- `.github/copilot-instructions.md`
- `.github/prompts/*.prompt.md`

Purpose:

- let Codex-style agents start from `AGENTS.md`
- let Claude Code start from `CLAUDE.md`, native specialist agents, and project commands
- let Cursor and Copilot pick up repo-level instructions without a separate export step

## Export bundles

The generator also writes tool-specific bundles into each workspace.

## Codex

Path:

- `integrations/codex/AGENTS.md`
- `integrations/codex/README.md`

Purpose:

- give Codex-style agents repo guidance
- anchor the workflow around markdown artifacts and review gates

## Claude Code

Path:

- `integrations/claude/CLAUDE.md`
- `integrations/claude/.claude/agents/*.md`
- `integrations/claude/.claude/commands/analyze-repo.md`
- `integrations/claude/.claude/commands/generate-slice-agents.md`
- `integrations/claude/.claude/commands/bootstrap-workspace.md`

Purpose:

- provide Claude Code project memory
- provide native Claude Code specialist agents for product and repo slices
- standardize repo analysis and slice-agent generation through project commands

## Cursor

Path:

- `integrations/cursor/.cursor/rules/00-control-plane.mdc`
- `integrations/cursor/.cursor/rules/10-specialists.mdc`

Purpose:

- expose repo rules in Cursor project-rule format
- surface both product-level specialists and repo-slice specialists

## Windsurf

Path:

- `integrations/windsurf/workspace-rule.md`
- `integrations/windsurf/README.md`

Purpose:

- provide a workspace rule that can be imported into Windsurf
- keep instructions concise and repo-aware

## GitHub Copilot

Path:

- `integrations/github-copilot/.github/copilot-instructions.md`
- `integrations/github-copilot/.github/prompts/plan-project.prompt.md`
- `integrations/github-copilot/README.md`

Purpose:

- provide repository-level instructions
- provide a reusable planning prompt

## Automation boundary

These files are generated artifacts, not guaranteed one-click installers for every future version of each tool. The current design focuses on producing the right repository conventions and markdown contracts so the workspace can be opened directly or copied into the target tool with minimal friction.

## Important constraint

The system currently generates integration files only. It does not:
- call remote tool APIs
- install rules into third-party products automatically
- synchronize updates back into external workspaces after generation

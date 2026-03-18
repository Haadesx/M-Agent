# Tool Integrations

The generator writes tool-specific bundles into each workspace.

## Codex

Path:

- `integrations/codex/AGENTS.md`
- `integrations/codex/README.md`

Purpose:

- give Codex-style agents repo guidance
- anchor the workflow around markdown artifacts and review gates

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

These bundles are generated artifacts, not guaranteed one-click installers for every future version of each tool. The current design focuses on producing the right files and guidance so the workspace can be imported or copied into the target tool with minimal friction.

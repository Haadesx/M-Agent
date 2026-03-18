# Tool Integrations

The generator writes tool-specific bundles into each workspace.

## Codex

Path:

- `integrations/codex/AGENTS.md`
- `integrations/codex/README.md`

Purpose:

- give Codex-style agents repo guidance
- anchor the workflow around markdown artifacts and review gates
- expose the generated workspace as a repo-scoped instruction pack

Import pattern:

- open the generated workspace in Codex
- start from `integrations/codex/AGENTS.md`
- use the generated markdown skills and slice agents as the operating context

## Cursor

Path:

- `integrations/cursor/.cursor/rules/00-control-plane.mdc`
- `integrations/cursor/.cursor/rules/10-specialists.mdc`

Purpose:

- expose repo rules in Cursor project-rule format
- surface both product-level specialists and repo-slice specialists

Import pattern:

- copy or merge the generated `.cursor/rules` files into the target Cursor workspace
- keep `00-control-plane.mdc` as the baseline rule
- keep `10-specialists.mdc` as the specialist registry

## Windsurf

Path:

- `integrations/windsurf/workspace-rule.md`
- `integrations/windsurf/README.md`

Purpose:

- provide a workspace rule that can be imported into Windsurf
- keep instructions concise and repo-aware

Import pattern:

- import `workspace-rule.md` into Windsurf Customizations
- use the generated README as the operator-facing setup note

## GitHub Copilot

Path:

- `integrations/github-copilot/.github/copilot-instructions.md`
- `integrations/github-copilot/.github/prompts/plan-project.prompt.md`
- `integrations/github-copilot/README.md`

Purpose:

- provide repository-level instructions
- provide a reusable planning prompt

Import pattern:

- place `copilot-instructions.md` at the repo-level `.github/` path expected by Copilot
- keep `prompts/plan-project.prompt.md` available for planning-oriented sessions

## Automation boundary

These bundles are generated artifacts, not guaranteed one-click installers for every future version of each tool. The current design focuses on producing the right files and guidance so the workspace can be imported or copied into the target tool with minimal friction.

## Important constraint

The system currently generates integration files only. It does not:
- call remote tool APIs
- install rules into third-party products automatically
- synchronize updates back into external workspaces after generation

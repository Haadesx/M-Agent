# AGENTS.md

This repository is a markdown-first agent factory. Treat it as a local-first planning and governance system, not as an application server.

## Core Contract

- Use a two-layer architecture at all times.
- Knowledge layer: markdown files, checklists, standards, procedures, memory, plans, and summaries.
- Execution layer: MCP servers or secure middleware for any live action such as API calls, database queries, message delivery, or credentialed tool use.
- Never move workflow logic into MCP when a markdown skill can encode it more cheaply.

## Phase 0 Gate

Before any implementation:
- derive the minimum viable system from the user idea
- produce a milestone roadmap using `get-shit-done` style sequencing
- express the roadmap in small, auditable phases inspired by `superpowers`
- stop and wait for approval

## Planning Standard

- Ask clarifying questions until the goal, user, constraints, and v1 scope are stable.
- Prefer simple, decision-complete plans over speculative platform design.
- Break execution into bite-sized tasks with explicit verification steps.
- Favor TDD, evidence, and direct verification over claims.

## Memory Standard

- Always load `memory/executive-summary/system-rules.md` first.
- Load `memory/executive-summary/current-state.md` at session start and after major checkpoints.
- Use timeline notes only for active chronology and recovery.
- Use the PARA brain for durable knowledge and reference material.
- Mark stale facts as superseded before archiving them.

## Token Discipline

- Prefer 200-500 token skills.
- Keep permanent rules compact and high signal.
- Do not paste large schemas or tool catalogs into prompt context unless they are required for the current action.
- Summarize before escalating to deep context.

## Security

- Never store API keys, OAuth tokens, cookies, secrets, or raw PII in markdown memory.
- Route all authenticated actions through the MCP layer or approved auth middleware.
- Apply least privilege to every tool connection.
- If healthcare or regulated data appears in scope, load the compliance templates before implementation.

## Temporal Ledger

- Use git as the cognitive ledger when the workspace is version controlled.
- Checkpoint major state changes with intentful commit messages.
- Record the last meaningful checkpoint in current state.
- Preserve auditability; do not rewrite history casually.

## Context Decay

- Weekly: condense the current state to active work only.
- Monthly: archive stale daily notes and superseded plans.
- Per task: delete redundant scratch notes once the durable summary exists.
- Never let active summary files become chronological dumps.

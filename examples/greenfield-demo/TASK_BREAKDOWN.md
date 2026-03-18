# Task Breakdown

## Greenfield mode

These tasks were derived from the brief alone because no repo path was provided.

## Tasks

1. Lock the Minimum Viable System
   - Owner: Product Architect
   - Summary: Turn the brief into the smallest buildable system, define acceptance criteria, and remove speculative scope before implementation begins.
   - Outputs: Minimum viable system statement, acceptance criteria, out-of-scope list
   - Targets: `PRODUCT.md`, `ROADMAP.md`, `TASK_BREAKDOWN.md`

2. Design the Primary User Flow
   - Owner: Frontend Systems Agent
   - Summary: Break the user-facing workflow into the first screen or operator path that must exist for the product to feel real and testable.
   - Outputs: Primary flow outline, state and screen list, UX copy checkpoints
   - Targets: primary interface flow, first operator screen, critical state transitions

3. Define Core System Contracts
   - Owner: Backend Orchestrator
   - Summary: Define the minimum data model, service contracts, and execution path required to make the first workflow operational.
   - Outputs: core entities, service boundaries, minimal persistence and API contract
   - Targets: core data model, primary service contracts, execution pipeline

4. Specify the Domain Workflow Loop
   - Owner: Support Automation Specialist
   - Summary: Translate the buyer problem into the smallest repeatable domain loop the product must perform well on day one.
   - Outputs: domain workflow spec, decision rules, exception and escalation notes
   - Targets: core domain loop, primary decision points, operational handoff rules

5. Define the Execution Boundary
   - Owner: MCP Operator
   - Summary: Separate markdown-side reasoning from live actions and define the narrowest connector or runtime boundary needed for the first release.
   - Outputs: connector boundary, input and output contract, failure handling note
   - Targets: MCP contract, connector inputs, connector outputs

6. Set the Security and Review Posture
   - Owner: Security Reviewer
   - Summary: Define the baseline handling rules for secrets, sensitive inputs, auditability, and review gates before implementation starts.
   - Outputs: security checklist, review gate list, secret-handling guardrails
   - Targets: `compliance/`, `mcp/auth-middleware.md`, `memory/executive-summary/system-rules.md`

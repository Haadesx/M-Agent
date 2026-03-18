# Authentication Middleware Strategy

Do not store API keys or OAuth tokens in markdown memory.

## Preferred Pattern

- Use middleware such as Composio, Arcade, Nango, or an equivalent internal broker.
- Let the middleware own OAuth flows, token refresh, and secret storage.
- Pass only scoped capabilities to the agent.
- Require just-in-time permission checks for high-risk actions.

## Decision Guide

- Choose Composio for developer-heavy teams that want broad connector coverage and managed flows.
- Choose Arcade for high-security actions that benefit from runtime approval gates.
- Choose Nango when open-source control and self-hosting matter more than convenience.

## Contract Rules

- Every connector must define the exact actions the agent may invoke.
- Every action must state what gets logged.
- Every connector must have a revocation path.
- High-risk tools must support human review or policy gates.

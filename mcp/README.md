# MCP Execution Layer

This directory defines the action boundary for the factory.

Rules:
- markdown holds knowledge, rules, and judgment
- MCP holds live actions and secret-backed integrations
- every MCP capability needs a narrow contract
- prefer one connector per domain over giant tool dumps
- include failure modes, retries, and permission model in the contract

Suggested contract fields:
- action name
- purpose
- required inputs
- expected output
- auth source
- side effects
- retry policy
- audit fields

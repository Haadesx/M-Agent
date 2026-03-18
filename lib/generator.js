const fs = require("node:fs/promises");
const path = require("node:path");
const { analyzeCodebase } = require("./codebase");

const ROOT = path.resolve(__dirname, "..");
const INSTANCES_DIR = path.join(ROOT, "instances");

const riskProfiles = {
  soc2: {
    label: "SOC 2 ready",
    summary:
      "Security controls, role-based access, change management, and audit logging are required from the first production rollout.",
    controls: ["Role-based access", "Audit trail", "Vendor inventory", "Incident runbook"],
    compliance: ["SOC 2"],
  },
  hipaa: {
    label: "HIPAA sensitive",
    summary:
      "PHI handling, minimum-necessary access, redaction, and BAA-dependent vendor selection are mandatory before deployment.",
    controls: ["Minimum necessary", "BAA coverage", "PHI audit trail", "Redaction policy"],
    compliance: ["HIPAA", "SOC 2"],
  },
  baseline: {
    label: "Baseline security",
    summary:
      "Keep credentials out of memory, constrain connectors, and preserve an audit trail without overengineering the first release.",
    controls: ["Least privilege", "Connector scoping", "Key isolation", "Failure logging"],
    compliance: [],
  },
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project";
}

function titleCase(value) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function articleize(value) {
  return /^[aeiou]/i.test(value) ? `an ${value}` : `a ${value}`;
}

function sentence(value, fallback) {
  const text = (value || "").trim() || fallback;
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function clip(value, max = 140) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(target) {
  await fs.mkdir(target, { recursive: true });
}

async function copyDir(source, destination) {
  await ensureDir(destination);
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const src = path.join(source, entry.name);
    const dst = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      await copyDir(src, dst);
    } else {
      await fs.copyFile(src, dst);
    }
  }
}

async function uniqueSlug(baseSlug, instancesDir = INSTANCES_DIR) {
  let candidate = baseSlug;
  let index = 2;
  while (await exists(path.join(instancesDir, candidate))) {
    candidate = `${baseSlug}-${index}`;
    index += 1;
  }
  return candidate;
}

function inferDomainSpecialist(input) {
  const haystack = `${input.productName} ${input.problem} ${input.workflow} ${input.customer}`.toLowerCase();

  if (/(health|patient|clinical|ehr|care)/.test(haystack)) {
    return {
      slug: "clinical-operations",
      title: "Clinical Operations Specialist",
      role:
        "Own the healthcare workflow model, data minimization boundaries, and operational handoffs needed for regulated environments.",
      decisions:
        "Translate user intent into compliant workflows, ensure PHI does not drift into the wrong files, and coordinate with security and compliance on redaction and access control.",
    };
  }

  if (/(finance|risk|payment|invoice|fraud|trading)/.test(haystack)) {
    return {
      slug: "risk-operations",
      title: "Risk Operations Specialist",
      role:
        "Own financial workflow logic, approval gates, and exception handling across operational and compliance-sensitive processes.",
      decisions:
        "Make risk classifications explicit, preserve auditability, and encode review steps before live financial actions are delegated to integrations.",
    };
  }

  if (/(developer|repo|pull request|ci|code|engineering|bug|deploy)/.test(haystack) || input.productLane === "Dev Tool") {
    return {
      slug: "developer-productivity",
      title: "Developer Productivity Specialist",
      role:
        "Own repository workflows, execution guardrails, and engineering feedback loops across coding-agent surfaces.",
      decisions:
        "Turn coding workflows into small deterministic steps, preserve traceability, and keep platform-specific instructions aligned across tools.",
    };
  }

  if (/(revenue|sales|account|pipeline|crm|outreach)/.test(haystack)) {
    return {
      slug: "revenue-operations",
      title: "Revenue Operations Specialist",
      role:
        "Own account intelligence, pipeline workflow logic, and execution sequencing for revenue-facing users.",
      decisions:
        "Keep next-step logic inspectable in markdown, coordinate CRM actions through MCP, and preserve a clear separation between planning and side effects.",
    };
  }

  if (/(support|ticket|customer success|helpdesk|inbox)/.test(haystack)) {
    return {
      slug: "support-automation",
      title: "Support Automation Specialist",
      role:
        "Own triage, routing, and response workflow design for support and service teams.",
      decisions:
        "Focus on accurate classification, escalation rules, and safe handoff to live messaging systems through a narrow action boundary.",
    };
  }

  return {
    slug: "workflow-strategist",
    title: "Workflow Strategy Specialist",
    role:
      "Own the domain workflow, the value path for the primary buyer, and the handoff between planning logic and execution.",
    decisions:
      "Reduce the product to the narrowest operational loop that creates measurable value and encode that loop in reviewable markdown.",
  };
}

function buildRoadmap(input) {
  return [
    {
      title: "Scope the minimum viable system",
      description: `Confirm the buyer, pain, and measurable outcome for ${input.customer}, then reduce ${input.productName} to the smallest workflow that proves operational value.`,
    },
    {
      title: "Stand up governance and memory",
      description:
        "Generate the control files, executive summaries, timeline notes, and PARA structure that the agents will rely on across sessions.",
    },
    {
      title: "Generate specialized agents",
      description:
        "Produce concise markdown skills for architecture, execution, security, and the domain-specific workflow owner aligned to the product brief.",
    },
    {
      title: "Define action boundaries and exports",
      description:
        "Create the MCP contracts and tool-specific integration bundles for Codex, Cursor, Windsurf, and GitHub Copilot.",
    },
  ];
}

function findSubagent(subagents, slug) {
  return subagents.find((agent) => agent.slug === slug) || subagents[0];
}

function buildTaskBreakdown(input, subagents, analysis) {
  const productArchitect = findSubagent(subagents, "product-architect");
  const frontend = findSubagent(subagents, "frontend-systems");
  const backend = findSubagent(subagents, "backend-orchestrator");
  const security = findSubagent(subagents, "security-reviewer");
  const mcp = findSubagent(subagents, "mcp-operator");
  const domain =
    subagents.find(
      (agent) =>
        !["product-architect", "frontend-systems", "backend-orchestrator", "security-reviewer", "mcp-operator", "compliance-officer"].includes(agent.slug)
    ) || subagents[subagents.length - 1];

  if (analysis) {
    return [
      {
        slug: "task-scope-lock",
        title: "Lock Scope and Slice Boundaries",
        ownerSlug: productArchitect.slug,
        ownerTitle: productArchitect.title,
        summary:
          "Reduce the requested repo task to the smallest approved change set, confirm which slices are actually in scope, and record what should stay untouched.",
        outputs: ["Approved scope note", "Out-of-scope list", "Cross-slice escalation note if needed"],
        targets: ["PRODUCT.md", "ROADMAP.md", "CODEBASE_MAP.md", "TASK_DISPATCH.md"],
      },
      ...analysis.modules.slice(0, 6).map((module) => ({
        slug: `task-${module.id}`,
        title: `Execute ${module.title}`,
        ownerSlug: module.id,
        ownerTitle: `${module.recommendedAgent}: ${module.title}`,
        summary: module.taskSlice,
        outputs: [
          `Patch plan for ${module.path}`,
          "Concrete files to edit",
          "Handoff note if another slice or docs path is required",
        ],
        targets: module.sampleFiles.length ? module.sampleFiles : [module.path],
      })),
      {
        slug: "task-verify-closeout",
        title: "Verify and Close Out",
        ownerSlug: findSubagent(subagents, "developer-productivity").slug,
        ownerTitle: findSubagent(subagents, "developer-productivity").title,
        summary:
          "Define the narrowest regression checks, review checkpoints, and release notes required after slice work lands.",
        outputs: ["Verification checklist", "Test focus list", "Review summary and rollout note"],
        targets: [
          "TASK_BREAKDOWN.md",
          "memory/executive-summary/current-state.md",
          ...analysis.modules.flatMap((module) => module.sampleFiles.slice(0, 1)),
        ],
      },
    ];
  }

  return [
    {
      slug: "task-scope-mvs",
      title: "Lock the Minimum Viable System",
      ownerSlug: productArchitect.slug,
      ownerTitle: productArchitect.title,
      summary:
        "Turn the brief into the smallest buildable system, define acceptance criteria, and remove speculative scope before implementation begins.",
      outputs: ["Minimum viable system statement", "Acceptance criteria", "Out-of-scope list"],
      targets: ["PRODUCT.md", "ROADMAP.md", "TASK_BREAKDOWN.md"],
    },
    {
      slug: "task-primary-flow",
      title: "Design the Primary User Flow",
      ownerSlug: frontend.slug,
      ownerTitle: frontend.title,
      summary:
        "Break the user-facing workflow into the first screen or operator path that must exist for the product to feel real and testable.",
      outputs: ["Primary flow outline", "State and screen list", "UX copy checkpoints"],
      targets: ["Primary interface flow", "First operator screen", "Critical state transitions"],
    },
    {
      slug: "task-system-contracts",
      title: "Define Core System Contracts",
      ownerSlug: backend.slug,
      ownerTitle: backend.title,
      summary:
        "Define the minimum data model, service contracts, and execution path required to make the first workflow operational.",
      outputs: ["Core entities", "Service boundaries", "Minimal persistence and API contract"],
      targets: ["Core data model", "Primary service contracts", "Execution pipeline"],
    },
    {
      slug: "task-domain-loop",
      title: "Specify the Domain Workflow Loop",
      ownerSlug: domain.slug,
      ownerTitle: domain.title,
      summary:
        "Translate the buyer problem into the smallest repeatable domain loop the product must perform well on day one.",
      outputs: ["Domain workflow spec", "Decision rules", "Exception and escalation notes"],
      targets: ["Core domain loop", "Primary decision points", "Operational handoff rules"],
    },
    {
      slug: "task-execution-boundary",
      title: "Define the Execution Boundary",
      ownerSlug: mcp.slug,
      ownerTitle: mcp.title,
      summary:
        "Separate markdown-side reasoning from live actions and define the narrowest connector or runtime boundary needed for the first release.",
      outputs: ["Connector boundary", "Input and output contract", "Failure handling note"],
      targets: ["MCP contract", "Connector inputs", "Connector outputs"],
    },
    {
      slug: "task-security-posture",
      title: "Set the Security and Review Posture",
      ownerSlug: security.slug,
      ownerTitle: security.title,
      summary:
        "Define the baseline handling rules for secrets, sensitive inputs, auditability, and review gates before implementation starts.",
      outputs: ["Security checklist", "Review gate list", "Secret-handling guardrails"],
      targets: ["compliance/", "mcp/auth-middleware.md", "memory/executive-summary/system-rules.md"],
    },
  ];
}

function buildSubagents(input) {
  const risk = riskProfiles[input.riskLevel] || riskProfiles.baseline;
  const domain = inferDomainSpecialist(input);
  const base = [
    {
      slug: "product-architect",
      title: "Product Architect",
      role:
        "Own system decomposition, scope control, and the mapping from product brief to generated artifacts.",
      decisions:
        "Define the minimum viable system, cut speculative scope, and preserve a clean execution handoff for all downstream agents.",
    },
    {
      slug: "frontend-systems",
      title: "Frontend Systems Agent",
      role:
        "Own the product surface, operator flows, and state transitions visible to users and reviewers.",
      decisions:
        "Translate the workflow into screens and states, keep copy concrete, and make the handoff between planning and action legible.",
    },
    {
      slug: "backend-orchestrator",
      title: "Backend Orchestrator",
      role:
        "Own the application contracts, persistence model, and the execution pipeline behind the user-facing workflow.",
      decisions:
        "Model the entities and transitions directly from the approved scope, prefer simple storage, and keep tool calls outside the knowledge layer.",
    },
    {
      slug: "security-reviewer",
      title: "Security Reviewer",
      role:
        "Own permission boundaries, secret handling, and auditability across generated files and live actions.",
      decisions:
        `Hold the product to a ${risk.label} posture, enforce least privilege, and stop credentials or sensitive data from leaking into markdown memory.`,
    },
    {
      slug: "mcp-operator",
      title: "MCP Operator",
      role:
        "Own the execution boundary, including all authenticated calls, retries, failure modes, and logging requirements.",
      decisions:
        "Keep the tool surface narrow, define exact inputs and outputs, and reject workflow logic that belongs in markdown instead of connectors.",
    },
    domain,
  ];

  if (input.riskLevel !== "baseline") {
    base.push({
      slug: "compliance-officer",
      title: "Compliance Officer",
      role:
        "Own the mapping between product scope and the controls required for launch and enterprise review.",
      decisions:
        `Translate ${risk.compliance.join(" + ")} obligations into concrete retention, access review, and evidence expectations without expanding the product scope unnecessarily.`,
    });
  }

  return base;
}

function buildGeneratedSkill(agent, input) {
  return `# ${agent.title}

## Role and Identity

${agent.role}

## Markdown Skills

- Work from the approved product brief for ${input.productName}, not from generic templates.
- Keep the primary buyer in focus: ${input.customer}.
- Use this problem statement as the operational anchor: ${sentence(input.problem, "Undefined problem")}
- Support this workflow: ${sentence(input.workflow, "Undefined workflow")}
- Make decisions explicit and reviewable in markdown before delegating live work through MCP.
- Escalate when scope, security posture, or execution authority becomes unclear.

## Decision Rules

- ${agent.decisions}
- Preserve a strict separation between product logic and tool-backed side effects.
- Keep files small, composable, and easy to inspect in coding-agent tools.

## Temporal Ledger Instructions

- Record each material decision that changes architecture, scope, or workflow behavior.
- If the workspace is version controlled, commit meaningful state changes instead of piling them into one opaque checkpoint.
- Leave enough context for another agent or engineer to continue without rediscovery.

## Context Decay Rules

- Summarize repetitive exploration into one durable note.
- Remove stale scratch work from the active state once the durable summary exists.
- Archive superseded ideas instead of mixing old and new policy in the same file.
`;
}

function buildProductBrief(input) {
  return `# Product Brief

## Name

${input.productName}

## Primary Buyer

${input.customer}

## Problem

${sentence(input.problem, "Undefined problem")}

## Core Workflow

${sentence(input.workflow, "Undefined workflow")}

## Positioning

- Product lane: ${input.productLane}
- Interface mode: ${input.interfaceMode}
- Delivery priority: ${input.priority}
- Security posture: ${(riskProfiles[input.riskLevel] || riskProfiles.baseline).label}
- Repo context: ${input.repoPath || "None provided"}
- Requested implementation task: ${sentence(input.task, "No task provided")}

## Success Criteria

- The system can generate a project workspace from a short brief.
- The workspace includes specialized sub-agents encoded as markdown.
- The generated pack includes operational exports for the selected coding-agent tools.
- If a codebase path is provided, the system maps the repository into task slices and writes mini-agent instructions for each slice.
`;
}

function buildRoadmapMd(input, roadmap) {
  return `# Delivery Roadmap

## Minimum Viable System

- Primary buyer: ${input.customer}
- Core product: ${input.productName}
- Narrowest value loop: ${sentence(input.workflow, "Undefined workflow")}
- Delivery principle: keep logic in markdown, keep live actions in MCP

## Milestones

${roadmap
  .map(
    (item, index) => `${index + 1}. ${item.title}
   ${item.description}`
  )
  .join("\n\n")}

## Constraints

- ${sentence(input.problem, "Undefined problem")}
- The first release should favor ${input.priority.toLowerCase()}.
- Sensitive access should follow the ${(riskProfiles[input.riskLevel] || riskProfiles.baseline).label} posture.
`;
}

function buildProductAgentsMd(input) {
  const rootContract = `# Product Scope: ${input.productName}

- Primary buyer: ${input.customer}
- Problem: ${sentence(input.problem, "Undefined problem")}
- Core workflow: ${sentence(input.workflow, "Undefined workflow")}
- Product lane: ${input.productLane}
- Interface mode: ${input.interfaceMode}
- Security posture: ${(riskProfiles[input.riskLevel] || riskProfiles.baseline).label}

`;

  return rootContract;
}

function buildCurrentState(input, subagents) {
  return `# Current State

## Active Product

- Name: ${input.productName}
- Primary buyer: ${input.customer}
- Core problem: ${sentence(input.problem, "Undefined problem")}
- Core workflow: ${sentence(input.workflow, "Undefined workflow")}
- Repo path: ${input.repoPath || "Not provided"}
- Requested task: ${sentence(input.task, "No task provided")}

## Current Phase

- Status: Phase 0 ready for approval
- Next checkpoint: Review roadmap and generated sub-agents
- Last checkpoint hash: none

## Active Specialists

${subagents.map((agent) => `- ${agent.title}`).join("\n")}

## Risk Posture

- ${(riskProfiles[input.riskLevel] || riskProfiles.baseline).label}
`;
}

function buildTaskBreakdownMd(tasks, analysis) {
  return `# Task Breakdown

## Purpose

This file breaks the current project into smaller implementation tasks that flagship coding agents can pick up directly.

${analysis ? "## Repo-aware mode\n\nThese tasks were grounded in the detected repository slices and sample files.\n" : "## Greenfield mode\n\nThese tasks were derived from the brief alone because no repo path was provided.\n"}

## Tasks

${tasks
    .map(
      (task, index) => `${index + 1}. ${task.title}
   - Owner: ${task.ownerTitle}
   - Summary: ${task.summary}
   - Outputs: ${task.outputs.join(", ")}
   - Targets: ${task.targets.join(", ")}`
    )
    .join("\n\n")}
`;
}

function buildCodebaseOverviewMd(analysis) {
  return `# Codebase Overview

## Repository

- Name: ${analysis.repoName}
- Path: ${analysis.repoPath}
- Files scanned: ${analysis.fileCount}
- Slices detected: ${analysis.moduleCount}
- Framework hints: ${analysis.frameworks.join(", ") || "Not detected"}
- Requested task: ${analysis.task}
- Extra context: ${analysis.contextNotes}

## Primary Languages

${analysis.languages
  .slice(0, 8)
  .map((item) => `- ${item.language}: ${item.count}`)
  .join("\n")}

## Key Files

${analysis.keyFiles.length ? analysis.keyFiles.map((file) => `- ${file}`).join("\n") : "- None detected"}

## Slices

${analysis.modules
  .map(
    (module) => `### ${module.title}
- Path: ${module.path}
- Kind: ${module.kind}
- Files: ${module.fileCount}
- Primary language: ${module.primaryLanguage}
- Recommended agent: ${module.recommendedAgent}
- Summary: ${module.summary}
- Task slice: ${module.taskSlice}`
  )
  .join("\n\n")}
`;
}

function buildTaskDispatchMd(analysis) {
  return `# Task Dispatch

## Requested Task

${analysis.task}

## Dispatch Strategy

${analysis.modules
  .map(
    (module, index) => `${index + 1}. ${module.title}
   - Path: ${module.path}
   - Agent: ${module.recommendedAgent}
   - Task slice: ${module.taskSlice}
   - Sample files: ${module.sampleFiles.join(", ") || "None"}`
  )
  .join("\n\n")}
`;
}

function buildSliceSkill(module, analysis, input) {
  return `# ${module.recommendedAgent}: ${module.title}

## Role and Identity

You own the code slice at \`${module.path}\` inside ${analysis.repoName}. Your changes should stay within this boundary unless the task explicitly forces a cross-cutting edit.

## Markdown Skills

- Work from the requested task: ${analysis.task}
- Use the buyer and workflow context from ${input.productName} to understand intent.
- Treat this slice as a ${module.kind} module primarily written in ${module.primaryLanguage}.
- Start from these files: ${module.sampleFiles.join(", ") || module.path}
- Keep coordination notes in markdown and reserve live execution for the MCP boundary.

## Decision Rules

- ${module.taskSlice}
- Escalate if the change requires touching another slice or changing public contracts.
- Leave a handoff summary for adjacent slice agents when you expose a dependency.

## Temporal Ledger Instructions

- Record why this slice was chosen for the task.
- Note any cross-slice dependency created or updated.

## Context Decay Rules

- Remove transient exploration notes after they are promoted into the codebase map or task dispatch.
- Keep only current task-specific context in the active slice notes.
`;
}

function buildTaskSkill(task, input) {
  return `# Task Agent: ${task.title}

## Role and Identity

You own the task "${task.title}" for ${input.productName}.

## Markdown Skills

- Work from the approved product brief for ${input.productName}.
- Keep the buyer in focus: ${input.customer}.
- Use this summary as your operating boundary: ${task.summary}
- Produce these outputs: ${task.outputs.join(", ")}.
- Start from these targets: ${task.targets.join(", ")}.

## Decision Rules

- Primary owner: ${task.ownerTitle}
- Escalate if the task grows beyond the named targets or requires a new execution boundary.
- Leave a short handoff note for the next task once your outputs are stable.

## Temporal Ledger Instructions

- Record the decision that moved the task from planning into implementation-ready shape.
- Note the smallest next step another agent can execute without rediscovery.

## Context Decay Rules

- Keep only the current task state in active notes.
- Fold repeated exploration into one durable summary and archive the rest.
`;
}

function buildCursorRule(input, subagents, analysis) {
  return `---
description: Core operating rules for ${input.productName}
alwaysApply: true
---
# ${input.productName}

- Primary buyer: ${input.customer}
- Requested task: ${sentence(input.task, "No task provided")}
- Keep knowledge in markdown and live actions in MCP.
- Refuse to store secrets or sensitive tokens in memory files.
- Stop for roadmap approval before implementation.
- Favor concise, reviewable files over giant instruction blobs.
- Available specialists: ${subagents.map((agent) => agent.title).join(", ")}.
${analysis ? `- Repository slices available: ${analysis.modules.map((module) => module.title).join(", ")}.` : ""}
`;
}

function buildCursorSubagentRule(subagents, analysis) {
  return `---
description: Specialized agents available in this workspace
alwaysApply: false
---
# Specialist Registry

${subagents
  .map(
    (agent) => `## ${agent.title}
- Use when: ${agent.role}
- Focus: ${agent.decisions}`
  )
  .join("\n\n")}

${analysis ? `\n## Codebase Slice Agents\n\n${analysis.modules
    .map(
      (module) => `### ${module.recommendedAgent}
- Slice: ${module.path}
- Task: ${module.taskSlice}`
    )
    .join("\n\n")}` : ""}
`;
}

function buildWindsurfRule(input, subagents, analysis) {
  return `# ${input.productName} Workspace Rule

- Buyer: ${input.customer}
- Product lane: ${input.productLane}
- Workflow: ${sentence(input.workflow, "Undefined workflow")}
- Requested task: ${sentence(input.task, "No task provided")}
- Keep logic in markdown files and route side effects through MCP.
- Do not place secrets in memory.
- Use the following specialists when relevant:
${subagents.map((agent) => `  - ${agent.title}`).join("\n")}
${analysis ? `- Codebase slices:\n${analysis.modules.map((module) => `  - ${module.title}: ${module.path}`).join("\n")}` : ""}
`;
}

function buildCopilotInstructions(input, subagents, analysis) {
  return `# Custom Instructions for ${input.productName}

You are working inside a local-first agent system.

- Primary buyer: ${input.customer}
- Problem: ${sentence(input.problem, "Undefined problem")}
- Core workflow: ${sentence(input.workflow, "Undefined workflow")}
- Requested task: ${sentence(input.task, "No task provided")}
- Keep durable knowledge in markdown.
- Keep live actions in MCP or secure middleware.
- Stop for roadmap approval before implementation.
- Available specialists: ${subagents.map((agent) => agent.title).join(", ")}.
${analysis ? `- Repository slices: ${analysis.modules.map((module) => `${module.title} (${module.path})`).join(", ")}.` : ""}
`;
}

function buildCopilotPrompt(input, analysis) {
  return `# Plan ${input.productName}

Review the product brief, identify the minimum viable system, propose a milestone roadmap, and stop before implementation until the roadmap is approved.
${analysis ? `\nUse the repository slice map before proposing implementation tasks:\n${analysis.modules.map((module) => `- ${module.title}: ${module.path}`).join("\n")}` : ""}
`;
}

function buildCodexReadme(input, analysis) {
  return `# Codex Integration

This export is designed for Codex-style repo guidance through AGENTS.md and markdown skills.

## Recommended Flow

1. Open the generated workspace for ${input.productName}.
2. Start with AGENTS.md and PRODUCT.md.
3. Review CODEBASE_MAP.md and TASK_DISPATCH.md before implementation.
4. Ask the agent to propose a Phase 0 roadmap.
5. Approve the roadmap before code generation.
${analysis ? `\n## Detected slices\n\n${analysis.modules.map((module) => `- ${module.title}: ${module.path}`).join("\n")}` : ""}
`;
}

function buildClaudeMemory(input, analysis, tasks) {
  return `# Claude Project Memory

See @AGENTS.md for the core project contract.

## Purpose

- Product: ${input.productName}
- Buyer: ${input.customer}
- Workflow: ${sentence(input.workflow, "Undefined workflow")}
- Requested task: ${sentence(input.task, "No task provided")}

## Repo-aware behavior

- If a repo path is present, start with @CODEBASE_MAP.md and @TASK_DISPATCH.md.
- Start task planning from @TASK_BREAKDOWN.md before implementation.
- Use the generated slice agents in \`.claude/agents/\` and the markdown specialists in \`skills/generated/\`.
- Use the generated task agents in \`.claude/agents/\` when the request matches one task cleanly.
- Keep durable logic in markdown and use filesystem artifacts as the main handoff layer.

${analysis ? `## Detected slices\n\n${analysis.modules.map((module) => `- ${module.title}: ${module.path}`).join("\n")}` : ""}
${tasks?.length ? `\n## Task Agents\n\n${tasks.map((task) => `- ${task.title}: ${task.ownerTitle}`).join("\n")}` : ""}
`;
}

function buildClaudeCommandAnalyze() {
  return `Analyze the repository path provided by the user or the current repo if the task is local.

Required output:
- repo summary
- key files
- slice boundaries
- recommended slice agents
- risks or missing context
`;
}

function buildClaudeCommandGenerate() {
  return `Generate or refresh markdown slice agents and integration files for this project.

Requirements:
- keep slice boundaries explicit
- write markdown artifacts instead of only describing them
- preserve compatibility with flagship coding agents
`;
}

function buildClaudeCommandBootstrap() {
  return `Bootstrap or refresh the project workspace from the current brief.

Requirements:
- write or update markdown specialists
- preserve the root-level repo entrypoints
- refresh tool-native files for Claude Code, Codex, Cursor, and Copilot
`;
}

function buildClaudeAgentForSpecialist(agent, input) {
  return `---
name: ${agent.slug}
description: ${clip(agent.role, 110)}
tools: Read, Glob, Grep, Bash, Edit, Write
---
You are the ${agent.title} for ${input.productName}.

- Primary buyer: ${input.customer}
- Workflow: ${sentence(input.workflow, "Undefined workflow")}
- Focus: ${agent.role}
- Decision rule: ${agent.decisions}
- Use \`skills/generated/${agent.slug}.md\` as the durable markdown brief for this role.
`;
}

function buildClaudeAgentForSlice(module) {
  return `---
name: ${slugify(module.title)}-slice
description: Own the ${module.path} slice when the task touches this module.
tools: Read, Glob, Grep, Bash, Edit, Write
---
You own the slice at \`${module.path}\`.

- Kind: ${module.kind}
- Primary language: ${module.primaryLanguage}
- Task slice: ${module.taskSlice}
- Keep edits local to this slice unless a shared dependency requires escalation.
`;
}

function buildClaudeAgentForTask(task, input) {
  return `---
name: ${task.slug}
description: Own the task "${clip(task.title, 90)}" for ${input.productName}.
tools: Read, Glob, Grep, Bash, Edit, Write
---
You own the task "${task.title}".

- Primary owner: ${task.ownerTitle}
- Summary: ${task.summary}
- Outputs: ${task.outputs.join(", ")}
- Targets: ${task.targets.join(", ")}
- Use \`TASK_BREAKDOWN.md\` as the global task map before editing anything.
`;
}

function buildWindsurfReadme() {
  return `# Windsurf Integration

Import the workspace rule into Windsurf as a Workspace Rule. Prefer Always On for the core rule and keep the rule concise enough to fit within Windsurf's documented rule limits.
`;
}

function buildCopilotReadme() {
  return `# GitHub Copilot Integration

Use the generated custom instructions as the repository-level guidance for Copilot Chat and store the prompt file as a reusable planning prompt for new project sessions.
`;
}

async function writeText(target, content) {
  await ensureDir(path.dirname(target));
  await fs.writeFile(target, content, "utf8");
}

async function writeDirectRepoPlatformFiles(projectDir, input, subagents, analysis, rootAgents, tasks) {
  await writeText(path.join(projectDir, "CLAUDE.md"), buildClaudeMemory(input, analysis, tasks));
  await writeText(path.join(projectDir, ".github", "copilot-instructions.md"), buildCopilotInstructions(input, subagents, analysis));
  await writeText(path.join(projectDir, ".github", "prompts", "plan-project.prompt.md"), buildCopilotPrompt(input, analysis));
  await writeText(path.join(projectDir, ".cursor", "rules", "00-control-plane.mdc"), buildCursorRule(input, subagents, analysis));
  await writeText(path.join(projectDir, ".cursor", "rules", "10-specialists.mdc"), buildCursorSubagentRule(subagents, analysis));
  await writeText(path.join(projectDir, ".claude", "commands", "analyze-repo.md"), buildClaudeCommandAnalyze());
  await writeText(path.join(projectDir, ".claude", "commands", "generate-slice-agents.md"), buildClaudeCommandGenerate());
  await writeText(path.join(projectDir, ".claude", "commands", "bootstrap-workspace.md"), buildClaudeCommandBootstrap());
  for (const agent of subagents) {
    await writeText(
      path.join(projectDir, ".claude", "agents", `${agent.slug}.md`),
      buildClaudeAgentForSpecialist(agent, input)
    );
  }
  for (const task of tasks) {
    await writeText(
      path.join(projectDir, ".claude", "agents", `${task.slug}.md`),
      buildClaudeAgentForTask(task, input)
    );
  }
  if (analysis) {
    for (const module of analysis.modules) {
      await writeText(
        path.join(projectDir, ".claude", "agents", `${module.id}.md`),
        buildClaudeAgentForSlice(module)
      );
    }
  }
  await writeText(path.join(projectDir, "AGENT_ENTRYPOINTS.md"), `# Agent Entry Points

- AGENTS.md
- CLAUDE.md
- .claude/agents/
- .claude/commands/
- .github/copilot-instructions.md
- .github/prompts/
- .cursor/rules/

Use these files to operate the generated workspace directly from flagship coding-agent tools.
`);
}

async function writeIntegrationFiles(projectDir, input, subagents, rootAgents, analysis, tasks) {
  const cursorDir = path.join(projectDir, "integrations", "cursor", ".cursor", "rules");
  const claudeDir = path.join(projectDir, "integrations", "claude");
  const windsurfDir = path.join(projectDir, "integrations", "windsurf");
  const copilotDir = path.join(projectDir, "integrations", "github-copilot", ".github");
  const codexDir = path.join(projectDir, "integrations", "codex");

  await writeText(path.join(claudeDir, "CLAUDE.md"), buildClaudeMemory(input, analysis, tasks));
  await writeText(path.join(claudeDir, ".claude", "commands", "analyze-repo.md"), buildClaudeCommandAnalyze());
  await writeText(path.join(claudeDir, ".claude", "commands", "generate-slice-agents.md"), buildClaudeCommandGenerate());
  await writeText(path.join(claudeDir, ".claude", "commands", "bootstrap-workspace.md"), buildClaudeCommandBootstrap());
  for (const agent of subagents) {
    await writeText(
      path.join(claudeDir, ".claude", "agents", `${agent.slug}.md`),
      buildClaudeAgentForSpecialist(agent, input)
    );
  }
  for (const task of tasks) {
    await writeText(
      path.join(claudeDir, ".claude", "agents", `${task.slug}.md`),
      buildClaudeAgentForTask(task, input)
    );
  }
  if (analysis) {
    for (const module of analysis.modules) {
      await writeText(
        path.join(claudeDir, ".claude", "agents", `${module.id}.md`),
        buildClaudeAgentForSlice(module)
      );
    }
  }

  await writeText(path.join(cursorDir, "00-control-plane.mdc"), buildCursorRule(input, subagents, analysis));
  await writeText(path.join(cursorDir, "10-specialists.mdc"), buildCursorSubagentRule(subagents, analysis));

  await writeText(path.join(windsurfDir, "workspace-rule.md"), buildWindsurfRule(input, subagents, analysis));
  await writeText(path.join(windsurfDir, "README.md"), buildWindsurfReadme());

  await writeText(path.join(copilotDir, "copilot-instructions.md"), buildCopilotInstructions(input, subagents, analysis));
  await writeText(path.join(copilotDir, "prompts", "plan-project.prompt.md"), buildCopilotPrompt(input, analysis));
  await writeText(path.join(projectDir, "integrations", "github-copilot", "README.md"), buildCopilotReadme());

  await writeText(path.join(codexDir, "AGENTS.md"), rootAgents);
  await writeText(path.join(codexDir, "README.md"), buildCodexReadme(input, analysis));

  return [
    {
      tool: "Codex",
      summary: "Repo-level AGENTS guidance and markdown skills for Codex-compatible workflows.",
      files: ["integrations/codex/AGENTS.md", "integrations/codex/README.md"],
    },
    {
      tool: "Claude Code",
      summary: "Project memory and slash-command exports for Claude Code workflows.",
      files: [
        "integrations/claude/CLAUDE.md",
        "integrations/claude/.claude/commands/analyze-repo.md",
        "integrations/claude/.claude/commands/generate-slice-agents.md",
        "integrations/claude/.claude/agents/*.md",
      ],
    },
    {
      tool: "Cursor",
      summary: "Project rules exported in `.cursor/rules` MDC format for Cursor project rules.",
      files: [
        "integrations/cursor/.cursor/rules/00-control-plane.mdc",
        "integrations/cursor/.cursor/rules/10-specialists.mdc",
      ],
    },
    {
      tool: "Windsurf",
      summary: "Workspace rule markdown ready to import into Windsurf Customizations.",
      files: ["integrations/windsurf/workspace-rule.md", "integrations/windsurf/README.md"],
    },
    {
      tool: "GitHub Copilot",
      summary: "Custom instructions and a reusable planning prompt for Copilot-driven sessions.",
      files: [
        "integrations/github-copilot/.github/copilot-instructions.md",
        "integrations/github-copilot/.github/prompts/plan-project.prompt.md",
      ],
    },
  ];
}

async function collectFiles(projectDir, current = projectDir) {
  const entries = await fs.readdir(current, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(current, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await collectFiles(projectDir, fullPath));
    } else {
      files.push(path.relative(projectDir, fullPath));
    }
  }
  return files.sort();
}

async function writeManifest(projectDir, manifest) {
  await writeText(path.join(projectDir, "manifest.json"), JSON.stringify(manifest, null, 2));
}

async function readManifest(projectDir) {
  const target = path.join(projectDir, "manifest.json");
  const content = await fs.readFile(target, "utf8");
  return JSON.parse(content);
}

async function listProjects() {
  await ensureDir(INSTANCES_DIR);
  const entries = await fs.readdir(INSTANCES_DIR, { withFileTypes: true });
  const manifests = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const projectDir = path.join(INSTANCES_DIR, entry.name);
    const manifestPath = path.join(projectDir, "manifest.json");
    if (!(await exists(manifestPath))) {
      continue;
    }
    const manifest = await readManifest(projectDir);
    manifests.push({
      slug: manifest.slug,
      productName: manifest.productName,
      customer: manifest.customer,
      riskLabel: manifest.riskLabel,
      createdAt: manifest.createdAt,
      subagentCount: manifest.subagents.length,
      integrationCount: manifest.integrations.length,
      moduleCount: manifest.metrics?.moduleCount || 0,
      repoPath: manifest.repoPath || "",
      workspacePath: manifest.workspacePath,
    });
  }

  return manifests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getProject(slug) {
  const projectDir = path.join(INSTANCES_DIR, slug);
  return readManifest(projectDir);
}

async function readProjectFile(slug, relativePath) {
  const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const projectDir = path.join(INSTANCES_DIR, slug);
  const fullPath = path.join(projectDir, safePath);
  const resolvedProjectDir = path.resolve(projectDir);
  const resolvedFullPath = path.resolve(fullPath);
  if (!resolvedFullPath.startsWith(resolvedProjectDir)) {
    throw new Error("Invalid path");
  }
  const content = await fs.readFile(resolvedFullPath, "utf8");
  return {
    path: safePath,
    content,
  };
}

async function createProject(input, options = {}) {
  const instancesDir = options.instancesDir || INSTANCES_DIR;
  await ensureDir(instancesDir);
  const now = new Date().toISOString();
  const baseSlug = slugify(input.productName);
  const slug = await uniqueSlug(baseSlug, instancesDir);
  const projectDir = path.join(instancesDir, slug);
  const risk = riskProfiles[input.riskLevel] || riskProfiles.baseline;
  const roadmap = buildRoadmap(input);
  const subagents = buildSubagents(input);
  const analysis = input.repoPath ? await analyzeCodebase(input) : null;
  const taskBreakdown = buildTaskBreakdown(input, subagents, analysis);

  await ensureDir(projectDir);
  await copyDir(path.join(ROOT, "memory"), path.join(projectDir, "memory"));
  await copyDir(path.join(ROOT, "compliance"), path.join(projectDir, "compliance"));
  await copyDir(path.join(ROOT, "mcp"), path.join(projectDir, "mcp"));
  await copyDir(path.join(ROOT, "prompts"), path.join(projectDir, "prompts"));

  const rootAgentsContent = await fs.readFile(path.join(ROOT, "AGENTS.md"), "utf8");
  const productAgents = `${buildProductAgentsMd(input)}${rootAgentsContent}`;

  await writeText(path.join(projectDir, "AGENTS.md"), productAgents);
  await writeText(path.join(projectDir, "PRODUCT.md"), buildProductBrief(input));
  await writeText(path.join(projectDir, "ROADMAP.md"), buildRoadmapMd(input, roadmap));
  await writeText(path.join(projectDir, "TASK_BREAKDOWN.md"), buildTaskBreakdownMd(taskBreakdown, analysis));
  await writeText(
    path.join(projectDir, "memory", "executive-summary", "current-state.md"),
    buildCurrentState(input, subagents)
  );

  if (analysis) {
    await writeText(path.join(projectDir, "CODEBASE_MAP.md"), buildCodebaseOverviewMd(analysis));
    await writeText(path.join(projectDir, "TASK_DISPATCH.md"), buildTaskDispatchMd(analysis));
    await writeText(
      path.join(projectDir, "memory", "brain", "resources", "codebase-analysis.md"),
      buildCodebaseOverviewMd(analysis)
    );
  }

  await writeText(
    path.join(projectDir, "skills", "generated", "INDEX.md"),
    `# Specialist Index

${subagents.map((agent) => `- [${agent.title}](./${agent.slug}.md)`).join("\n")}
${taskBreakdown.length ? `\n## Task Agents\n\n${taskBreakdown.map((task) => `- [${task.title}](./tasks/${task.slug}.md)`).join("\n")}` : ""}
${analysis ? `\n## Codebase Slices\n\n${analysis.modules.map((module) => `- [${module.recommendedAgent}: ${module.title}](./slices/${module.id}.md)`).join("\n")}` : ""}
`
  );

  for (const agent of subagents) {
    await writeText(
      path.join(projectDir, "skills", "generated", `${agent.slug}.md`),
      buildGeneratedSkill(agent, input)
    );
  }

  for (const task of taskBreakdown) {
    await writeText(
      path.join(projectDir, "skills", "generated", "tasks", `${task.slug}.md`),
      buildTaskSkill(task, input)
    );
  }

  if (analysis) {
    for (const module of analysis.modules) {
      await writeText(
        path.join(projectDir, "skills", "generated", "slices", `${module.id}.md`),
        buildSliceSkill(module, analysis, input)
      );
    }
  }

  await writeDirectRepoPlatformFiles(projectDir, input, subagents, analysis, productAgents, taskBreakdown);
  const integrations = await writeIntegrationFiles(projectDir, input, subagents, productAgents, analysis, taskBreakdown);
  const files = await collectFiles(projectDir);

  const manifest = {
    slug,
    workspacePath: projectDir,
    createdAt: now,
    updatedAt: now,
    productName: input.productName,
    customer: input.customer,
    problem: sentence(input.problem, "Undefined problem"),
    workflow: sentence(input.workflow, "Undefined workflow"),
    productLane: input.productLane,
    priority: input.priority,
    interfaceMode: input.interfaceMode,
    repoPath: input.repoPath || "",
    task: sentence(input.task, "No task provided"),
    contextNotes: sentence(input.contextNotes, "No extra context provided"),
    riskLevel: input.riskLevel,
    riskLabel: risk.label,
    riskSummary: risk.summary,
    controls: risk.controls,
    roadmap,
    subagents,
    taskBreakdown,
    codebase: analysis,
    chat: analysis ? analysis.messages : [],
    integrations,
    files,
    metrics: {
      subagentCount: subagents.length,
      taskCount: taskBreakdown.length,
      integrationCount: integrations.length,
      fileCount: files.length,
      moduleCount: analysis ? analysis.moduleCount : 0,
    },
    hero: {
      headline: `${input.productName} turns ${clip(input.problem.toLowerCase(), 120)}`,
      summary: analysis
        ? `${input.productName} mapped ${analysis.moduleCount} repository slices from ${analysis.repoName} and generated code-aware markdown agents for ${input.customer}.`
        : `${input.productName} is designed for ${input.customer} with ${articleize(input.interfaceMode.toLowerCase())} that keeps knowledge in markdown and execution in MCP.`,
    },
  };

  await writeManifest(projectDir, manifest);
  return manifest;
}

module.exports = {
  ROOT,
  INSTANCES_DIR,
  createProject,
  listProjects,
  getProject,
  readProjectFile,
  slugify,
  analyzeCodebase,
};

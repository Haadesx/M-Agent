const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const {
  analyzeCodebase,
  createProject,
  slugify,
} = require("../lib/generator");

test("slugify normalizes product names", () => {
  assert.equal(slugify("Agent Systems Control Plane"), "agent-systems-control-plane");
});

test("createProject writes a complete workspace manifest", async () => {
  const instancesDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-system-test-"));
  const project = await createProject({
    productName: "QA Control Plane",
    customer: "Platform engineering teams",
    problem: "Internal agent standards are fragmented across repos and tools",
    workflow:
      "Capture a project brief, generate markdown specialists, and export tool-specific instruction packs",
    productLane: "Dev Tool",
    riskLevel: "soc2",
    priority: "Enterprise controls",
    interfaceMode: "Agent builder",
  }, { instancesDir });

  assert.equal(project.productName, "QA Control Plane");
  assert.ok(project.subagents.length >= 5);
  assert.equal(project.integrations.length, 5);
  assert.ok(project.integrations.some((item) => item.tool === "Claude Code"));
  assert.ok(project.files.includes("AGENTS.md"));
  assert.ok(project.files.includes("CLAUDE.md"));
  assert.ok(project.files.includes("AGENT_ENTRYPOINTS.md"));
  assert.ok(project.files.includes(".claude/agents/security-reviewer.md"));
  assert.ok(project.files.includes("integrations/cursor/.cursor/rules/00-control-plane.mdc"));
  const productFile = await fs.readFile(path.join(project.workspacePath, "PRODUCT.md"), "utf8");
  assert.match(productFile, /QA Control Plane/);
});

test("analyzeCodebase maps repository slices from a local path", async () => {
  const repoDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-system-repo-"));
  await fs.mkdir(path.join(repoDir, "src", "components"), { recursive: true });
  await fs.mkdir(path.join(repoDir, "src", "api"), { recursive: true });
  await fs.writeFile(path.join(repoDir, "package.json"), JSON.stringify({
    dependencies: { react: "^19.0.0", next: "^15.0.0" },
  }), "utf8");
  await fs.writeFile(path.join(repoDir, "src", "components", "Card.tsx"), "export const Card = () => null;\n", "utf8");
  await fs.writeFile(path.join(repoDir, "src", "api", "route.ts"), "export async function GET() {}\n", "utf8");

  const analysis = await analyzeCodebase({
    productName: "Repo Mapper",
    customer: "Platform teams",
    problem: "Need structured decomposition",
    workflow: "Map the repo into slices",
    repoPath: repoDir,
    task: "Add an analytics dashboard",
    contextNotes: "Prefer the frontend slice first",
  });

  assert.equal(analysis.repoName, path.basename(repoDir));
  assert.ok(analysis.fileCount >= 3);
  assert.ok(analysis.moduleCount >= 1);
  assert.ok(analysis.modules.some((module) => module.path.includes("src")));
});

test("createProject writes codebase artifacts when repo context is provided", async () => {
  const repoDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-system-repo-project-"));
  const instancesDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-system-instance-project-"));
  await fs.mkdir(path.join(repoDir, "app", "dashboard"), { recursive: true });
  await fs.writeFile(path.join(repoDir, "package.json"), JSON.stringify({
    dependencies: { next: "^15.0.0", react: "^19.0.0" },
  }), "utf8");
  await fs.writeFile(path.join(repoDir, "app", "dashboard", "page.tsx"), "export default function Page() { return null; }\n", "utf8");

  const project = await createProject({
    productName: "Control Plane",
    customer: "Engineering orgs",
    problem: "Task routing is manual",
    workflow: "Break a repo into slices and create markdown agents",
    productLane: "Dev Tool",
    riskLevel: "baseline",
    priority: "Workflow depth",
    interfaceMode: "Agent builder",
    repoPath: repoDir,
    task: "Implement a dashboard settings flow",
    contextNotes: "UI-first task",
  }, { instancesDir });

  assert.ok(project.codebase);
  assert.ok(project.files.includes("CODEBASE_MAP.md"));
  assert.ok(project.files.includes("TASK_DISPATCH.md"));
  assert.ok(project.files.some((file) => file.startsWith("skills/generated/slices/")));
  assert.ok(project.files.some((file) => file.startsWith(".claude/agents/")));
  assert.ok(project.files.some((file) => file.startsWith("integrations/claude/.claude/agents/")));
  assert.ok(project.integrations.some((item) => item.tool === "Cursor"));
  assert.ok(project.integrations.some((item) => item.tool === "Claude Code"));
});

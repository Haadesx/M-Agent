const fs = require("node:fs/promises");
const path = require("node:path");

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  ".cache",
  ".turbo",
  ".idea",
  ".vscode",
  "vendor",
  "tmp",
  "temp",
  "output",
  ".playwright-cli",
]);

const CODE_EXTENSIONS = new Map([
  [".js", "JavaScript"],
  [".cjs", "JavaScript"],
  [".mjs", "JavaScript"],
  [".ts", "TypeScript"],
  [".tsx", "TypeScript"],
  [".jsx", "JavaScript"],
  [".py", "Python"],
  [".go", "Go"],
  [".rs", "Rust"],
  [".java", "Java"],
  [".kt", "Kotlin"],
  [".rb", "Ruby"],
  [".php", "PHP"],
  [".swift", "Swift"],
  [".css", "CSS"],
  [".scss", "SCSS"],
  [".html", "HTML"],
  [".md", "Markdown"],
  [".json", "JSON"],
  [".yml", "YAML"],
  [".yaml", "YAML"],
  [".sql", "SQL"],
  [".sh", "Shell"],
]);

function clip(text, max = 140) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function sentence(value, fallback) {
  const text = (value || "").trim() || fallback;
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

async function safeReadJson(target) {
  try {
    const content = await fs.readFile(target, "utf8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function scanFiles(rootPath, options = {}, current = rootPath, depth = 0, files = []) {
  const maxDepth = options.maxDepth ?? 6;
  const maxFiles = options.maxFiles ?? 1500;
  if (depth > maxDepth || files.length >= maxFiles) {
    return files;
  }

  const entries = await fs.readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    if (files.length >= maxFiles) {
      break;
    }
    if (entry.name.startsWith(".DS_Store")) {
      continue;
    }
    const fullPath = path.join(current, entry.name);
    const relPath = path.relative(rootPath, fullPath);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      await scanFiles(rootPath, options, fullPath, depth + 1, files);
    } else {
      files.push(relPath);
    }
  }
  return files;
}

function languageStats(files) {
  const counts = new Map();
  for (const file of files) {
    const label = CODE_EXTENSIONS.get(path.extname(file).toLowerCase()) || "Other";
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([language, count]) => ({ language, count }));
}

async function detectFrameworks(rootPath) {
  const frameworks = [];
  const packageJson = await safeReadJson(path.join(rootPath, "package.json"));
  if (packageJson) {
    const deps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };
    if (deps.next) {
      frameworks.push("Next.js");
    }
    if (deps.react) {
      frameworks.push("React");
    }
    if (deps.express || deps.fastify || deps.koa) {
      frameworks.push("Node API");
    }
    if (deps.vite) {
      frameworks.push("Vite");
    }
  }

  if (await exists(path.join(rootPath, "pyproject.toml"))) {
    frameworks.push("Python");
  }
  if (await exists(path.join(rootPath, "requirements.txt"))) {
    frameworks.push("Python");
  }
  if (await exists(path.join(rootPath, "go.mod"))) {
    frameworks.push("Go");
  }
  if (await exists(path.join(rootPath, "Cargo.toml"))) {
    frameworks.push("Rust");
  }

  return unique(frameworks);
}

async function candidateModuleDirs(rootPath) {
  const preferredRoots = ["apps", "packages", "services", "src"];
  const candidates = [];

  for (const base of preferredRoots) {
    const target = path.join(rootPath, base);
    if (!(await exists(target))) {
      continue;
    }
    const entries = await fs.readdir(target, { withFileTypes: true });
    const childDirs = entries
      .filter((entry) => entry.isDirectory() && !IGNORED_DIRS.has(entry.name))
      .map((entry) => path.join(base, entry.name));
    if (childDirs.length) {
      candidates.push(...childDirs);
      return candidates;
    }

    if (base === "src") {
      candidates.push(base);
      return candidates;
    }
  }

  const topLevel = await fs.readdir(rootPath, { withFileTypes: true });
  for (const entry of topLevel) {
    if (!entry.isDirectory() || IGNORED_DIRS.has(entry.name)) {
      continue;
    }
    candidates.push(entry.name);
  }
  return candidates;
}

function inferModuleKind(modulePath, files) {
  const haystack = `${modulePath} ${files.join(" ")}`.toLowerCase();
  if (/(component|page|screen|ui|view|frontend|client)/.test(haystack)) {
    return "frontend";
  }
  if (/(api|server|backend|controller|route|handler|service)/.test(haystack)) {
    return "backend";
  }
  if (/(auth|security|permission|policy)/.test(haystack)) {
    return "security";
  }
  if (/(db|database|schema|migration|model|query|repository)/.test(haystack)) {
    return "data";
  }
  if (/(infra|terraform|docker|k8s|deploy|ops|ci|config)/.test(haystack)) {
    return "infrastructure";
  }
  if (/(test|spec|e2e|qa)/.test(haystack)) {
    return "quality";
  }
  if (/(shared|common|core|utils|lib)/.test(haystack)) {
    return "shared";
  }
  return "domain";
}

function recommendedAgentForKind(kind) {
  switch (kind) {
    case "frontend":
      return "Frontend Slice Agent";
    case "backend":
      return "Backend Slice Agent";
    case "security":
      return "Security Slice Agent";
    case "data":
      return "Data Slice Agent";
    case "infrastructure":
      return "Infrastructure Slice Agent";
    case "quality":
      return "Quality Slice Agent";
    case "shared":
      return "Shared Systems Agent";
    default:
      return "Domain Slice Agent";
  }
}

function moduleSummary(modulePath, kind, files, primaryLanguage, task) {
  const samples = files.slice(0, 3).join(", ");
  return `${modulePath} looks like a ${kind} slice primarily in ${primaryLanguage}. It has ${files.length} tracked files${samples ? ` including ${samples}` : ""}. Prioritize it for task work related to "${clip(task, 90)}".`;
}

function buildTaskSlice(module, task) {
  return `Own the ${module.kind} work required for: ${sentence(task, "Complete the requested task")} Restrict changes to ${module.path} unless you need a clearly justified dependency touch outside the slice.`;
}

function buildMessages(input, analysis) {
  const modules = analysis.modules
    .slice(0, 4)
    .map((module) => `${module.title} (${module.path})`)
    .join(", ");

  return [
    {
      role: "user",
      title: "Task request",
      content: `${input.task || input.workflow} Repo context: ${analysis.repoPath}.`,
    },
    {
      role: "assistant",
      title: "Codebase summary",
      content: `Mapped ${analysis.fileCount} files across ${analysis.moduleCount} slices. Framework hints: ${analysis.frameworks.join(", ") || "not detected"}. Primary languages: ${analysis.languages
        .slice(0, 3)
        .map((item) => `${item.language} (${item.count})`)
        .join(", ")}.`,
    },
    {
      role: "assistant",
      title: "Dispatch proposal",
      content: modules
        ? `Recommended first slices: ${modules}. Each slice gets its own markdown mini-agent and task boundary.`
        : "No clear module boundaries were detected, so the system will create a single repository-level slice agent.",
    },
  ];
}

async function analyzeCodebase(input) {
  const repoPath = path.resolve(input.repoPath);
  const repoStat = await fs.stat(repoPath).catch(() => null);
  if (!repoStat || !repoStat.isDirectory()) {
    throw new Error("Repo path does not exist or is not a directory");
  }

  const files = await scanFiles(repoPath, { maxDepth: 6, maxFiles: 1500 });
  const languages = languageStats(files);
  const frameworks = await detectFrameworks(repoPath);
  const candidates = await candidateModuleDirs(repoPath);
  const modules = [];

  for (const relDir of candidates.slice(0, 8)) {
    const scoped = files.filter((file) => file === relDir || file.startsWith(`${relDir}${path.sep}`) || file.startsWith(`${relDir}/`));
    if (!scoped.length) {
      continue;
    }
    const scopedLanguages = languageStats(scoped);
    const primaryLanguage = scopedLanguages[0]?.language || languages[0]?.language || "Mixed";
    const kind = inferModuleKind(relDir, scoped);
    modules.push({
      id: relDir.replace(/[\\/]/g, "-"),
      title: relDir.split(/[\\/]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" / "),
      path: relDir,
      kind,
      fileCount: scoped.length,
      primaryLanguage,
      sampleFiles: scoped.slice(0, 5),
      recommendedAgent: recommendedAgentForKind(kind),
      taskSlice: buildTaskSlice({ path: relDir, kind }, input.task || input.workflow || "the requested change"),
      summary: moduleSummary(relDir, kind, scoped, primaryLanguage, input.task || input.workflow || "the requested change"),
    });
  }

  if (!modules.length) {
    modules.push({
      id: "repo-root",
      title: path.basename(repoPath),
      path: ".",
      kind: "domain",
      fileCount: files.length,
      primaryLanguage: languages[0]?.language || "Mixed",
      sampleFiles: files.slice(0, 5),
      recommendedAgent: "Repository Slice Agent",
      taskSlice: buildTaskSlice({ path: ".", kind: "domain" }, input.task || input.workflow || "the requested change"),
      summary: `The repository did not expose clear subdirectories, so the first pass will treat the codebase as one slice.`,
    });
  }

  const analysis = {
    repoPath,
    repoName: path.basename(repoPath),
    task: sentence(input.task || input.workflow, "Analyze the repository"),
    contextNotes: sentence(input.contextNotes, "No extra context provided"),
    fileCount: files.length,
    moduleCount: modules.length,
    frameworks,
    languages,
    keyFiles: files.filter((file) => /(^|\/)(package\.json|pyproject\.toml|requirements\.txt|go\.mod|Cargo\.toml|README\.md|AGENTS\.md)$/i.test(file)).slice(0, 10),
    modules,
  };
  analysis.messages = buildMessages(input, analysis);
  return analysis;
}

module.exports = {
  analyzeCodebase,
};

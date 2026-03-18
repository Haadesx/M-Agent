const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { URL } = require("node:url");
const {
  ROOT,
  analyzeCodebase,
  createProject,
  getProject,
  listProjects,
  readProjectFile,
} = require("./lib/generator");

const PORT = Number(process.env.PORT || 4173);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".md": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf",
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function serveStatic(req, res, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(requested).replace(/^(\.\.(\/|\\|$))+/, "");
  const fullPath = path.join(ROOT, safePath);
  const resolvedRoot = path.resolve(ROOT);
  const resolvedFile = path.resolve(fullPath);
  if (!resolvedFile.startsWith(resolvedRoot)) {
    sendJson(res, 400, { error: "Invalid path" });
    return;
  }

  try {
    const stat = await fs.stat(resolvedFile);
    if (stat.isDirectory()) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }
    const ext = path.extname(resolvedFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const content = await fs.readFile(resolvedFile);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
}

function validateProjectInput(input) {
  const required = ["productName", "customer", "problem", "workflow"];
  for (const key of required) {
    if (!input[key] || typeof input[key] !== "string" || !input[key].trim()) {
      throw new Error(`Missing field: ${key}`);
    }
  }

  return {
    productName: input.productName.trim(),
    customer: input.customer.trim(),
    problem: input.problem.trim(),
    workflow: input.workflow.trim(),
    repoPath: typeof input.repoPath === "string" ? input.repoPath.trim() : "",
    task: typeof input.task === "string" ? input.task.trim() : "",
    contextNotes: typeof input.contextNotes === "string" ? input.contextNotes.trim() : "",
    productLane: (input.productLane || "AI SaaS").trim(),
    riskLevel: input.riskLevel || "baseline",
    priority: (input.priority || "Fast launch").trim(),
    interfaceMode: (input.interfaceMode || "Operator cockpit").trim(),
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (req.method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && pathname === "/api/projects") {
      const projects = await listProjects();
      sendJson(res, 200, { projects });
      return;
    }

    if (req.method === "POST" && pathname === "/api/projects") {
      const body = await readBody(req);
      const input = validateProjectInput(body);
      const project = await createProject(input);
      sendJson(res, 201, { project });
      return;
    }

    if (req.method === "POST" && pathname === "/api/analyze") {
      const body = await readBody(req);
      const input = validateProjectInput(body);
      if (!input.repoPath) {
        sendJson(res, 400, { error: "Missing field: repoPath" });
        return;
      }
      const analysis = await analyzeCodebase(input);
      sendJson(res, 200, { analysis });
      return;
    }

    const projectMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
    if (req.method === "GET" && projectMatch) {
      const project = await getProject(projectMatch[1]);
      sendJson(res, 200, { project });
      return;
    }

    const fileMatch = pathname.match(/^\/api\/projects\/([^/]+)\/file$/);
    if (req.method === "GET" && fileMatch) {
      const relativePath = url.searchParams.get("path");
      if (!relativePath) {
        sendJson(res, 400, { error: "Missing file path" });
        return;
      }
      const file = await readProjectFile(fileMatch[1], relativePath);
      sendJson(res, 200, { file });
      return;
    }

    await serveStatic(req, res, pathname);
  } catch (error) {
    const status = /Missing field|Invalid path/.test(error.message) ? 400 : 500;
    sendJson(res, status, { error: error.message || "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Agent Systems Control Plane running at http://127.0.0.1:${PORT}`);
});

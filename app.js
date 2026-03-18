const state = {
  projects: [],
  selectedProject: null,
  selectedTab: "overview",
  selectedFile: null,
  loading: false,
  analysisPreview: null,
};

const elements = {
  form: document.querySelector("#projectForm"),
  analyzeButton: document.querySelector("#analyzeButton"),
  submitButton: document.querySelector("#submitButton"),
  productName: document.querySelector("#productName"),
  customer: document.querySelector("#customer"),
  problem: document.querySelector("#problem"),
  workflow: document.querySelector("#workflow"),
  repoPath: document.querySelector("#repoPath"),
  task: document.querySelector("#task"),
  contextNotes: document.querySelector("#contextNotes"),
  productLane: document.querySelector("#productLane"),
  riskLevel: document.querySelector("#riskLevel"),
  priority: document.querySelector("#priority"),
  interfaceMode: document.querySelector("#interfaceMode"),
  healthStatus: document.querySelector("#healthStatus"),
  systemHeadline: document.querySelector("#systemHeadline"),
  systemSummary: document.querySelector("#systemSummary"),
  snapshotBuyer: document.querySelector("#snapshotBuyer"),
  snapshotRisk: document.querySelector("#snapshotRisk"),
  snapshotFiles: document.querySelector("#snapshotFiles"),
  snapshotIntegrations: document.querySelector("#snapshotIntegrations"),
  heroProjectCount: document.querySelector("#heroProjectCount"),
  heroSubagentCount: document.querySelector("#heroSubagentCount"),
  briefHeadline: document.querySelector("#briefHeadline"),
  briefSummary: document.querySelector("#briefSummary"),
  briefLane: document.querySelector("#briefLane"),
  briefPriority: document.querySelector("#briefPriority"),
  briefMode: document.querySelector("#briefMode"),
  repoInsightList: document.querySelector("#repoInsightList"),
  analysisTimeline: document.querySelector("#analysisTimeline"),
  chatThread: document.querySelector("#chatThread"),
  projectList: document.querySelector("#projectList"),
  projectTitle: document.querySelector("#projectTitle"),
  summaryRisk: document.querySelector("#summaryRisk"),
  summaryPath: document.querySelector("#summaryPath"),
  projectNarrative: document.querySelector("#projectNarrative"),
  summaryBuyer: document.querySelector("#summaryBuyer"),
  summaryPriority: document.querySelector("#summaryPriority"),
  summarySubagents: document.querySelector("#summarySubagents"),
  summaryFiles: document.querySelector("#summaryFiles"),
  roadmapList: document.querySelector("#roadmapList"),
  riskTitle: document.querySelector("#riskTitle"),
  riskSummary: document.querySelector("#riskSummary"),
  controlList: document.querySelector("#controlList"),
  codebaseTitle: document.querySelector("#codebaseTitle"),
  codebaseSummary: document.querySelector("#codebaseSummary"),
  frameworkList: document.querySelector("#frameworkList"),
  moduleGrid: document.querySelector("#moduleGrid"),
  subagentGrid: document.querySelector("#subagentGrid"),
  fileList: document.querySelector("#fileList"),
  fileViewerLabel: document.querySelector("#fileViewerLabel"),
  fileContent: document.querySelector("#fileContent"),
  integrationGrid: document.querySelector("#integrationGrid"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  tabPanels: {
    overview: document.querySelector("#tab-overview"),
    codebase: document.querySelector("#tab-codebase"),
    subagents: document.querySelector("#tab-subagents"),
    files: document.querySelector("#tab-files"),
    integrations: document.querySelector("#tab-integrations"),
  },
};

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

function formPayload() {
  return {
    productName: elements.productName.value.trim(),
    customer: elements.customer.value.trim(),
    problem: elements.problem.value.trim(),
    workflow: elements.workflow.value.trim(),
    repoPath: elements.repoPath.value.trim(),
    task: elements.task.value.trim(),
    contextNotes: elements.contextNotes.value.trim(),
    productLane: elements.productLane.value,
    riskLevel: elements.riskLevel.value,
    priority: elements.priority.value,
    interfaceMode: elements.interfaceMode.value,
  };
}

function setLoading(loading, mode = "generate") {
  state.loading = loading;
  elements.submitButton.disabled = loading;
  elements.analyzeButton.disabled = loading;
  elements.submitButton.textContent =
    loading && mode === "generate" ? "Generating workspace..." : "Generate workspace";
  elements.analyzeButton.textContent =
    loading && mode === "analyze" ? "Analyzing repo..." : "Analyze repo";
}

function renderHealth(ok) {
  elements.healthStatus.textContent = ok
    ? "Local API is running and ready to map repositories and generate workspaces."
    : "Backend unavailable. Start the local server to create workspaces.";
}

function renderTabs() {
  elements.tabs.forEach((tab) => {
    const active = tab.dataset.tab === state.selectedTab;
    tab.classList.toggle("is-active", active);
    elements.tabPanels[tab.dataset.tab].classList.toggle("is-active", active);
  });
}

function previewAnalysis() {
  return state.analysisPreview || state.selectedProject?.codebase || null;
}

function syncBriefPreview() {
  const payload = formPayload();
  elements.briefHeadline.textContent = `${payload.productName || "This product"} will map the repository and generate code-aware agent packs.`;
  elements.briefSummary.textContent = `${payload.task || payload.workflow || "Define the task."} The backend will turn repo context into slices, task dispatch, mini-agents, and tool exports.`;
  elements.briefLane.textContent = payload.productLane || "AI SaaS";
  elements.briefPriority.textContent = payload.priority || "Fast launch";
  elements.briefMode.textContent = payload.interfaceMode || "Operator cockpit";

  const analysis = previewAnalysis();
  const insights = [];
  insights.push(`Repo path: ${payload.repoPath || "Not provided"}`);
  insights.push(`Requested task: ${payload.task || "Not provided"}`);
  if (analysis) {
    insights.push(`Mapped ${analysis.fileCount} files into ${analysis.moduleCount} slices`);
    insights.push(`Framework hints: ${analysis.frameworks.join(", ") || "Not detected"}`);
  } else {
    insights.push("Run repo analysis to detect slices and frameworks");
  }

  elements.repoInsightList.innerHTML = insights
    .map((line) => `<div class="stack-item compact-item"><p>${line}</p></div>`)
    .join("");
}

function renderProjectList() {
  elements.heroProjectCount.textContent = String(state.projects.length);
  if (!state.projects.length) {
    elements.projectList.innerHTML = `<p class="empty-state">No workspaces yet. Analyze a repo or generate the first project.</p>`;
    return;
  }

  elements.projectList.innerHTML = state.projects
    .map(
      (project) => `
        <button class="project-list-item ${state.selectedProject && state.selectedProject.slug === project.slug ? "is-active" : ""}" data-slug="${project.slug}">
          <strong>${project.productName}</strong>
          <span>${project.customer}</span>
          <small>${project.riskLabel} · ${project.moduleCount ?? 0} slices · ${project.subagentCount ?? 0} agents</small>
        </button>
      `
    )
    .join("");

  elements.projectList.querySelectorAll("[data-slug]").forEach((button) => {
    button.addEventListener("click", () => loadProject(button.dataset.slug));
  });
}

function renderChat() {
  const analysis = previewAnalysis();
  if (!analysis?.messages?.length) {
    elements.chatThread.innerHTML = `
      <article class="chat-bubble assistant">
        <span>System</span>
        <p>Describe the task, point the system at a local repository, and run analysis. The thread will summarize the repo, propose task slices, and recommend mini-agent boundaries.</p>
      </article>
    `;
    return;
  }

  elements.chatThread.innerHTML = analysis.messages
    .map(
      (message) => `
        <article class="chat-bubble ${message.role}">
          <span>${message.title}</span>
          <p>${message.content}</p>
        </article>
      `
    )
    .join("");
}

function renderAnalysisPreview() {
  const analysis = previewAnalysis();
  if (!analysis) {
    elements.analysisTimeline.innerHTML = `
      <div class="timeline-item">
        <span class="timeline-index">01</span>
        <div>
          <strong>Awaiting analysis</strong>
          <p>Provide a repo path and task to see slice recommendations.</p>
        </div>
      </div>
    `;
    renderCodebase(null);
    renderChat();
    syncBriefPreview();
    return;
  }

  elements.analysisTimeline.innerHTML = [
    {
      title: "Repository scan",
      description: `Scanned ${analysis.fileCount} files from ${analysis.repoName} and detected ${analysis.frameworks.join(", ") || "no obvious framework"}.`,
    },
    {
      title: "Slice detection",
      description: `Identified ${analysis.moduleCount} codebase slices and assigned a recommended agent to each boundary.`,
    },
    {
      title: "Task dispatch",
      description: `Prepared module-specific task slices for "${analysis.task}".`,
    },
  ]
    .map(
      (item, index) => `
        <div class="timeline-item">
          <span class="timeline-index">${String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>${item.title}</strong>
            <p>${item.description}</p>
          </div>
        </div>
      `
    )
    .join("");

  renderCodebase(analysis);
  renderChat();
  syncBriefPreview();
}

function renderCodebase(analysis) {
  if (!analysis) {
    elements.codebaseTitle.textContent = "No repository mapped";
    elements.codebaseSummary.textContent =
      "Add a local repo path and analyze it to see frameworks, file counts, and module boundaries.";
    elements.frameworkList.innerHTML = "";
    elements.moduleGrid.innerHTML = `<p class="empty-state">No slice analysis yet.</p>`;
    return;
  }

  elements.codebaseTitle.textContent = `${analysis.repoName} · ${analysis.moduleCount} slices`;
  elements.codebaseSummary.textContent = `Task: ${analysis.task} Extra context: ${analysis.contextNotes}`;
  elements.frameworkList.innerHTML = [
    ...analysis.frameworks.map((framework) => `<span class="pill">${framework}</span>`),
    ...analysis.languages.slice(0, 3).map((item) => `<span class="pill">${item.language} · ${item.count}</span>`),
  ].join("");
  elements.moduleGrid.innerHTML = analysis.modules
    .map(
      (module) => `
        <article class="glass-card info-card module-card">
          <div class="panel-header">
            <span class="status-dot"></span>
            <span>${module.title}</span>
          </div>
          <p>${module.summary}</p>
          <div class="tag-list">
            <span class="pill">${module.path}</span>
            <span class="pill">${module.primaryLanguage}</span>
            <span class="pill">${module.recommendedAgent}</span>
          </div>
          <div class="info-footer">${module.taskSlice}</div>
        </article>
      `
    )
    .join("");
}

async function loadFile(relativePath) {
  if (!state.selectedProject) {
    return;
  }
  const payload = await fetchJSON(
    `/api/projects/${encodeURIComponent(state.selectedProject.slug)}/file?path=${encodeURIComponent(relativePath)}`
  );
  state.selectedFile = payload.file.path;
  elements.fileViewerLabel.textContent = payload.file.path;
  elements.fileContent.textContent = payload.file.content;
  renderFiles();
}

function renderFiles() {
  if (!state.selectedProject) {
    elements.fileList.innerHTML = `<p class="empty-state">No file tree loaded.</p>`;
    elements.fileViewerLabel.textContent = "File preview";
    elements.fileContent.textContent = "Select a generated file to inspect its contents.";
    return;
  }

  elements.fileList.innerHTML = state.selectedProject.files
    .map(
      (file) => `
        <button class="file-list-item ${state.selectedFile === file ? "is-active" : ""}" data-file="${file}">
          ${file}
        </button>
      `
    )
    .join("");

  elements.fileList.querySelectorAll("[data-file]").forEach((button) => {
    button.addEventListener("click", () => loadFile(button.dataset.file));
  });
}

function renderRoadmap(project) {
  elements.roadmapList.innerHTML = project.roadmap
    .map(
      (step, index) => `
        <div class="stack-item">
          <strong>${String(index + 1).padStart(2, "0")} · ${step.title}</strong>
          <p>${step.description}</p>
        </div>
      `
    )
    .join("");
}

function renderSubagents(project) {
  const sliceCount = project.codebase?.moduleCount || 0;
  elements.heroSubagentCount.textContent = String(project.subagents.length + sliceCount);

  const productAgents = project.subagents.map(
    (agent) => `
      <article class="glass-card info-card">
        <div class="panel-header">
          <span class="status-dot"></span>
          <span>${agent.title}</span>
        </div>
        <p>${agent.role}</p>
        <div class="info-footer">${agent.decisions}</div>
      </article>
    `
  );

  const sliceAgents = (project.codebase?.modules || []).map(
    (module) => `
      <article class="glass-card info-card module-card">
        <div class="panel-header">
          <span class="status-dot"></span>
          <span>${module.recommendedAgent}</span>
        </div>
        <p>${module.title} · ${module.path}</p>
        <div class="info-footer">${module.taskSlice}</div>
      </article>
    `
  );

  elements.subagentGrid.innerHTML = [...productAgents, ...sliceAgents].join("");
}

function renderIntegrations(project) {
  elements.integrationGrid.innerHTML = project.integrations
    .map(
      (integration) => `
        <article class="glass-card info-card">
          <div class="panel-header">
            <span class="status-dot"></span>
            <span>${integration.tool}</span>
          </div>
          <p>${integration.summary}</p>
          <div class="tag-list">
            ${integration.files.map((file) => `<span class="pill">${file}</span>`).join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderProject(project) {
  state.selectedProject = project;
  state.selectedFile = project.files[0] || null;
  state.analysisPreview = project.codebase || null;

  elements.systemHeadline.textContent = project.productName;
  elements.systemSummary.textContent = project.hero.summary;
  elements.snapshotBuyer.textContent = project.customer;
  elements.snapshotRisk.textContent = project.riskLabel;
  elements.snapshotFiles.textContent = String(project.metrics.fileCount);
  elements.snapshotIntegrations.textContent = String(project.metrics.integrationCount);

  elements.projectTitle.textContent = project.productName;
  elements.summaryRisk.textContent = project.riskLabel;
  elements.summaryPath.textContent = project.workspacePath;
  elements.projectNarrative.textContent = project.hero.summary;
  elements.summaryBuyer.textContent = project.customer;
  elements.summaryPriority.textContent = project.priority;
  elements.summarySubagents.textContent = String(project.metrics.subagentCount + (project.metrics.moduleCount || 0));
  elements.summaryFiles.textContent = String(project.metrics.fileCount);

  elements.riskTitle.textContent = project.riskLabel;
  elements.riskSummary.textContent = project.riskSummary;
  elements.controlList.innerHTML = project.controls
    .map((control) => `<span class="pill">${control}</span>`)
    .join("");

  renderRoadmap(project);
  renderSubagents(project);
  renderIntegrations(project);
  renderFiles();
  renderProjectList();
  renderAnalysisPreview();

  if (project.files[0]) {
    loadFile(project.files[0]).catch((error) => {
      elements.fileContent.textContent = error.message;
    });
  }
}

async function loadProject(slug) {
  const payload = await fetchJSON(`/api/projects/${encodeURIComponent(slug)}`);
  renderProject(payload.project);
}

async function refreshProjects() {
  const payload = await fetchJSON("/api/projects");
  state.projects = payload.projects;
  renderProjectList();
  if (!state.selectedProject && state.projects.length) {
    await loadProject(state.projects[0].slug);
  }
}

async function analyzeRepo() {
  const payload = formPayload();
  if (!payload.repoPath) {
    alert("Add a local repo path first.");
    return;
  }
  setLoading(true, "analyze");
  try {
    const response = await fetchJSON("/api/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.analysisPreview = response.analysis;
    elements.systemHeadline.textContent = response.analysis.repoName;
    elements.systemSummary.textContent = `Mapped ${response.analysis.fileCount} files into ${response.analysis.moduleCount} repository slices for the requested task.`;
    elements.snapshotBuyer.textContent = payload.customer || "Unspecified";
    elements.snapshotRisk.textContent = elements.riskLevel.options[elements.riskLevel.selectedIndex].text;
    elements.snapshotFiles.textContent = String(response.analysis.fileCount);
    elements.snapshotIntegrations.textContent = "4";
    renderAnalysisPreview();
  } catch (error) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
}

async function createProject(event) {
  event.preventDefault();
  setLoading(true, "generate");
  try {
    const payload = await fetchJSON("/api/projects", {
      method: "POST",
      body: JSON.stringify(formPayload()),
    });
    state.projects = [payload.project, ...state.projects.filter((item) => item.slug !== payload.project.slug)];
    renderProject(payload.project);
  } catch (error) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
}

async function initialize() {
  syncBriefPreview();
  renderAnalysisPreview();
  try {
    await fetchJSON("/api/health");
    renderHealth(true);
    await refreshProjects();
  } catch (error) {
    renderHealth(false);
    console.error(error);
  }
}

elements.form.addEventListener("submit", createProject);
elements.analyzeButton.addEventListener("click", analyzeRepo);
[
  elements.productName,
  elements.customer,
  elements.problem,
  elements.workflow,
  elements.repoPath,
  elements.task,
  elements.contextNotes,
  elements.productLane,
  elements.riskLevel,
  elements.priority,
  elements.interfaceMode,
].forEach((element) => {
  element.addEventListener("input", syncBriefPreview);
  element.addEventListener("change", syncBriefPreview);
});

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.selectedTab = tab.dataset.tab;
    renderTabs();
  });
});

renderTabs();
initialize();

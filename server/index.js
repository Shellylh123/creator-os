// Creator OS 服务端 — 模块化架构：
// 每个模块 = 读输入 → 跑 LLM/工具 → 写产物到 workspace/<项目>/ 下的标准文件。
// 模块既可被流水线自动串联（输入来自上一站产物），也可单独调用（输入由前端直接给）。
const express = require("express");
const fs = require("fs");
const path = require("path");
const prompts = require("./prompts");
const { runModule } = require("./llm");

// 轻量 .env 加载（不引依赖）
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const app = express();
const PORT = 3210;
const WORKSPACE = path.join(__dirname, "..", "workspace");
fs.mkdirSync(WORKSPACE, { recursive: true });

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/api/broll", require("./broll"));
app.use("/workspace", express.static(WORKSPACE)); // 成片/素材预览

// ---------- 工作区（流水线项目） ----------

function projectDir(id) {
  const safe = String(id).replace(/[^\w一-龥-]/g, "_");
  return path.join(WORKSPACE, safe);
}

function readJsonIfExists(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}

function loadProject(id) {
  const dir = projectDir(id);
  const meta = readJsonIfExists(path.join(dir, "project.json"));
  if (!meta) return null;
  return {
    ...meta,
    idea: fs.existsSync(path.join(dir, "01_idea.md")) ? fs.readFileSync(path.join(dir, "01_idea.md"), "utf8") : null,
    script: readJsonIfExists(path.join(dir, "02_script.json")),
    footage: readJsonIfExists(path.join(dir, "03_footage.json")),
    broll: readJsonIfExists(path.join(dir, "04_broll.json")),
    cover: readJsonIfExists(path.join(dir, "05_cover.json")),
    publish: readJsonIfExists(path.join(dir, "06_publish.json")),
  };
}

app.get("/api/projects", (_req, res) => {
  const list = fs.readdirSync(WORKSPACE, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => loadProject(d.name))
    .filter(Boolean)
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  res.json(list);
});

app.post("/api/projects", (req, res) => {
  const { title, type } = req.body; // type: koubo | knowledge
  if (!title) return res.status(400).json({ error: "缺少标题" });
  const id = title;
  const dir = projectDir(id);
  fs.mkdirSync(dir, { recursive: true });
  const meta = { id, title, type: type || "koubo", createdAt: new Date().toISOString() };
  fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify(meta, null, 2));
  res.json(loadProject(id));
});

app.get("/api/projects/:id", (req, res) => {
  const p = loadProject(req.params.id);
  if (!p) return res.status(404).json({ error: "项目不存在" });
  res.json(p);
});

// 保存/确认某一站的产物（人工修改后落盘）
app.post("/api/projects/:id/artifact/:name", (req, res) => {
  const dir = projectDir(req.params.id);
  if (!fs.existsSync(dir)) return res.status(404).json({ error: "项目不存在" });
  const allowed = {
    idea: "01_idea.md", script: "02_script.json", footage: "03_footage.json",
    broll: "04_broll.json", cover: "05_cover.json", publish: "06_publish.json",
  };
  const file = allowed[req.params.name];
  if (!file) return res.status(400).json({ error: "未知产物名" });
  const body = req.body.content;
  fs.writeFileSync(path.join(dir, file), typeof body === "string" ? body : JSON.stringify(body, null, 2));
  res.json({ ok: true });
});

// ---------- 模块（可独立调用，也可挂到项目上） ----------

async function moduleHandler(res, promptText, projectId, artifactFile) {
  try {
    const result = await runModule(promptText);
    if (projectId && artifactFile) {
      const dir = projectDir(projectId);
      if (fs.existsSync(dir)) fs.writeFileSync(path.join(dir, artifactFile), JSON.stringify(result, null, 2));
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// 模块①②：想法 → 口播稿
app.post("/api/module/script", (req, res) => {
  const { idea, projectId } = req.body;
  if (!idea) return res.status(400).json({ error: "缺少想法内容" });
  if (projectId) {
    const dir = projectDir(projectId);
    if (fs.existsSync(dir)) fs.writeFileSync(path.join(dir, "01_idea.md"), idea);
  }
  moduleHandler(res, prompts.optimizeScript(idea), projectId, "02_script.json");
});

// 模块④：转录稿 → B-roll 插入点
app.post("/api/module/broll", (req, res) => {
  const { transcript, projectId } = req.body;
  if (!transcript) return res.status(400).json({ error: "缺少转录稿" });
  moduleHandler(res, prompts.brollPoints(transcript), projectId, "04_broll.json");
});

// 模块⑥：脚本/转录稿 → 三平台文案包
app.post("/api/module/copypack", (req, res) => {
  const { script, title, projectId } = req.body;
  if (!script) return res.status(400).json({ error: "缺少脚本内容" });
  moduleHandler(res, prompts.copyPack(script, title), projectId, "06_publish.json");
});

// 模块提示词的读取与保存（"调优此 Agent"）
const PROMPTS_FILE = path.join(__dirname, "prompts.js");
app.get("/api/prompts", (_req, res) => {
  res.json({ content: fs.readFileSync(PROMPTS_FILE, "utf8") });
});

app.listen(PORT, () => {
  console.log(`Creator OS 运行中 → http://localhost:${PORT}`);
});

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
app.use("/api/publish", require("./publish"));
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
  const footage = readJsonIfExists(path.join(dir, "03_footage.json"));
  const brollOut = path.join(dir, "final_broll.mp4");
  const rendered = fs.existsSync(brollOut);
  // 发布用成片优先级：B-roll 合成片 > ClipLab 剪辑成品 > 原片
  const bestVideo = rendered ? brollOut : (footage && (footage.final_path || footage.path)) || null;
  return {
    ...meta,
    idea: fs.existsSync(path.join(dir, "01_idea.md")) ? fs.readFileSync(path.join(dir, "01_idea.md"), "utf8") : null,
    script: readJsonIfExists(path.join(dir, "02_script.json")),
    footage,
    broll: readJsonIfExists(path.join(dir, "04_broll.json")),
    rendered,
    bestVideo,
    dirName: path.basename(dir),
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

// ---------- 本地体验增强 ----------
const { execFile, spawn } = require("child_process");

// 原生文件选择器（本地应用形态的福利：macOS 弹系统选择框，拿到完整路径）
app.post("/api/pickfile", (req, res) => {
  const promptText = req.body.prompt || "选择文件";
  execFile("osascript", ["-e", `POSIX path of (choose file with prompt "${promptText.replace(/"/g, "")}")`],
    { timeout: 120000 }, (err, stdout) => {
      if (err) return res.json({ canceled: true });
      res.json({ path: stdout.trim() });
    });
});

// SRT 字幕 → 带时间戳转录稿
app.post("/api/srt2transcript", (req, res) => {
  try {
    const srt = fs.readFileSync(req.body.path, "utf8");
    const toSec = (t) => { const m = t.match(/(\d+):(\d+):(\d+)[,.](\d+)/); return (+m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000).toFixed(1); };
    const lines = [];
    for (const b of srt.split(/\r?\n\r?\n+/)) {
      const ls = b.trim().split(/\r?\n/);
      if (ls.length < 3 || !ls[1].includes("-->")) continue;
      const [a, z] = ls[1].split(" --> ");
      lines.push(`[${toSec(a)}-${toSec(z)}] ${ls.slice(2).join("")}`);
    }
    res.json({ transcript: lines.join("\n"), count: lines.length });
  } catch (e) { res.status(400).json({ error: "读取 SRT 失败: " + e.message }); }
});

// ClipLab 剪辑引擎：一键启动预处理（归一化+转录+AI断句，5-8 分钟无人值守）
const CLIPLAB_PREP = "/Users/liuhan/Movies/ClipLab/test-0704/skill_patch/cliplab_prep.sh";
const LOGS = path.join(__dirname, "..", "logs");
fs.mkdirSync(LOGS, { recursive: true });
app.post("/api/cliplab/prep", (req, res) => {
  const { videoPath } = req.body;
  if (!videoPath || !fs.existsSync(videoPath)) return res.status(400).json({ error: "视频文件不存在" });
  if (!fs.existsSync(CLIPLAB_PREP)) return res.status(500).json({ error: "ClipLab 引擎脚本未找到" });
  const log = fs.openSync(path.join(LOGS, "cliplab_prep.log"), "w");
  const child = spawn("caffeinate", ["-i", "bash", CLIPLAB_PREP, videoPath], { detached: true, stdio: ["ignore", log, log] });
  child.unref();
  res.json({ started: true, pid: child.pid });
});
// 找 ClipLab 剪辑成品（3_审核/video_30fps_cut.mp4 或 成品归档），取最新
app.post("/api/cliplab/final", (req, res) => {
  const { videoPath } = req.body || {};
  if (!videoPath) return res.status(400).json({ error: "缺少视频路径" });
  const base = path.basename(videoPath).replace(/\.[^.]+$/, "");
  const candidates = [];
  const outRoot = "/Users/liuhan/Movies/ClipLab/test-0704/output";
  try {
    for (const d of fs.readdirSync(outRoot)) {
      if (!d.includes(base)) continue;
      const f = path.join(outRoot, d, "剪口播", "3_审核", "video_30fps_cut.mp4");
      if (fs.existsSync(f)) candidates.push(f);
    }
  } catch {}
  try {
    const archive = "/Users/liuhan/Movies/ClipLab/成品";
    for (const f of fs.readdirSync(archive)) {
      if (f.includes(base) && f.endsWith(".mp4")) candidates.push(path.join(archive, f));
    }
  } catch {}
  if (!candidates.length) return res.json({ found: false });
  candidates.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  res.json({ found: true, path: candidates[0] });
});

// 本地视频流（白名单目录内），用于界面预览剪辑成片
app.get("/api/video", (req, res) => {
  const p = req.query.path || "";
  const allowed = ["/Users/liuhan/Movies/ClipLab", WORKSPACE, "/Users/liuhan/Downloads"];
  const real = path.resolve(p);
  if (!allowed.some((root) => real.startsWith(root))) return res.status(403).json({ error: "路径不在允许范围" });
  if (!fs.existsSync(real)) return res.status(404).json({ error: "文件不存在" });
  res.sendFile(real);
});

app.get("/api/cliplab/log", (_req, res) => {
  try {
    const t = fs.readFileSync(path.join(LOGS, "cliplab_prep.log"), "utf8").split("\n");
    res.json({ tail: t.slice(-25).join("\n") });
  } catch { res.json({ tail: "（还没有日志）" }); }
});

// 模块提示词的读取与保存（"调优此 Agent"）
const PROMPTS_FILE = path.join(__dirname, "prompts.js");
app.get("/api/prompts", (_req, res) => {
  res.json({ content: fs.readFileSync(PROMPTS_FILE, "utf8") });
});

app.listen(PORT, () => {
  console.log(`Creator OS 运行中 → http://localhost:${PORT}`);
});

// B-roll 模块：素材检索 → 下载 → ffmpeg 合成。
// 导出一个 express.Router，由 server/index.js 挂载（挂载方式见 index.js 里的一行注释）。
//   const broll = require("./broll");
//   app.use("/api/broll", broll);
//
// 三个接口：
//   POST /search    {points:[{start,end,type,search_en,desc}], projectId?}  → 每点附 candidates
//   POST /download  {url, dest_name, projectId}                             → 下载选中素材
//   POST /render    {videoPath, items:[{start,end,assetPath,mode}], projectId} → 合成竖屏成片
const express = require("express");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const router = express.Router();

const WORKSPACE = path.join(__dirname, "..", "workspace");
const STOCK_PY = path.join(__dirname, "broll_stock.py");
const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const FFPROBE = "/opt/homebrew/bin/ffprobe";

// python3.11 优先系统安装；没有就退 openmontage-eval 的 venv（装了依赖，但本 helper 纯标准库其实两者都行）。
const PYTHON = fs.existsSync("/opt/homebrew/bin/python3.11")
  ? "/opt/homebrew/bin/python3.11"
  : path.join(process.env.HOME || "", "Projects/openmontage-eval/venv/bin/python3.11");

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"]);

function projectDir(id) {
  const safe = String(id || "_broll").replace(/[^\w一-龥-]/g, "_");
  return path.join(WORKSPACE, safe);
}

function isImage(p) {
  return IMAGE_EXT.has(path.extname(p).toLowerCase());
}

// 跑一个子进程，收集 stdout/stderr，Promise 化。
function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 1024 * 1024 * 32, ...opts }, (err, stdout, stderr) => {
      if (err) {
        err.stderr = stderr;
        err.stdout = stdout;
        return reject(err);
      }
      resolve({ stdout, stderr });
    });
  });
}

// 调 python helper 并解析它的 JSON 输出。
async function callStock(args) {
  const { stdout } = await run(PYTHON, [STOCK_PY, ...args]);
  const line = stdout.trim().split("\n").pop();
  return JSON.parse(line);
}

async function probeDuration(file) {
  const { stdout } = await run(FFPROBE, [
    "-v", "error", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", file,
  ]);
  const d = parseFloat(stdout.trim());
  return Number.isFinite(d) ? d : null;
}

// ---------- POST /search ----------
router.post("/search", async (req, res) => {
  const { points, projectId } = req.body || {};
  if (!Array.isArray(points)) return res.status(400).json({ error: "缺少 points 数组" });

  try {
    const enriched = [];
    for (const pt of points) {
      const query = pt.search_en || pt.desc || "";
      let candidates = [];
      let note;
      if (query) {
        const out = await callStock([
          "search", "--type", pt.type || "footage", "--query", query, "--n", "3",
        ]);
        if (out.error) note = out.error;
        candidates = out.candidates || [];
        if (out.note) note = out.note;
      } else {
        note = "该点缺少 search_en/desc，跳过检索";
      }
      enriched.push({ ...pt, candidates, ...(note ? { note } : {}) });
    }
    if (projectId) {
      const dir = projectDir(projectId);
      if (fs.existsSync(dir)) {
        fs.writeFileSync(path.join(dir, "04_broll.json"), JSON.stringify({ points: enriched }, null, 2));
      }
    }
    res.json({ points: enriched });
  } catch (e) {
    res.status(500).json({ error: `检索失败：${e.message}`, detail: e.stderr || e.stdout });
  }
});

// ---------- POST /download ----------
router.post("/download", async (req, res) => {
  const { url, dest_name, projectId } = req.body || {};
  if (!url || !dest_name) return res.status(400).json({ error: "缺少 url 或 dest_name" });

  const assetsDir = path.join(projectDir(projectId), "assets");
  // dest_name 只取 basename，防目录穿越。
  const dest = path.join(assetsDir, path.basename(dest_name));
  try {
    const out = await callStock(["download", "--url", url, "--dest", dest]);
    if (out.error) return res.status(502).json({ error: out.error });
    res.json({ assetPath: out.path, bytes: out.bytes });
  } catch (e) {
    res.status(500).json({ error: `下载失败：${e.message}`, detail: e.stderr || e.stdout });
  }
});

// ---------- POST /render ----------
// 输入 1080x1440 竖屏口播底片，把每个 item 的素材按 mode 叠加/插入。
//   pip  : 素材缩到画面宽 45%，居中放在上方 1/3，start~end 显示
//   full : 素材铺满全屏盖住原画（保留原声），start~end 显示
// 视频素材静音循环，图片素材静态展示。一次编码完成。
router.post("/render", async (req, res) => {
  const { videoPath, items, projectId } = req.body || {};
  if (!videoPath || !fs.existsSync(videoPath)) {
    return res.status(400).json({ error: `底片视频不存在：${videoPath}` });
  }
  const list = Array.isArray(items) ? items : [];

  const outDir = projectDir(projectId);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "final_broll.mp4");

  try {
    const mainDur = await probeDuration(videoPath);

    // 底片是 input 0；每个素材各占一个 input。
    const inputs = ["-i", videoPath];
    list.forEach((it) => {
      if (isImage(it.assetPath)) {
        inputs.push("-loop", "1", "-i", it.assetPath);        // 图片循环成视频流
      } else {
        inputs.push("-stream_loop", "-1", "-i", it.assetPath); // 视频循环（音轨不 map = 静音）
      }
    });

    // 构造 filter_complex：素材依次叠到 base 上。
    const parts = [];
    let base = "0:v";
    list.forEach((it, i) => {
      const idx = i + 1;
      const s = Number(it.start) || 0;
      const e = Number(it.end) || 0;
      const enable = `enable='between(t,${s},${e})'`;
      const aLabel = `a${i}`;
      const outLabel = `b${i}`;
      if (it.mode === "full") {
        // 铺满 1080x1440：等比放大后裁切，避免变形。
        parts.push(`[${idx}:v]scale=1080:1440:force_original_aspect_ratio=increase,crop=1080:1440,setsar=1[${aLabel}]`);
        parts.push(`[${base}][${aLabel}]overlay=0:0:${enable}[${outLabel}]`);
      } else {
        // pip：宽 = 1080*0.45 ≈ 486，高自适应（-2 保持偶数）；居中放上方 1/3。
        parts.push(`[${idx}:v]scale=486:-2,setsar=1[${aLabel}]`);
        parts.push(`[${base}][${aLabel}]overlay=x=(W-w)/2:y=(H/3-h/2):${enable}[${outLabel}]`);
      }
      base = outLabel;
    });

    const args = [...inputs];
    const vmap = list.length ? `[${base}]` : "0:v";
    if (parts.length) {
      args.push("-filter_complex", parts.join(";"));
    }
    args.push("-map", vmap, "-map", "0:a?");
    if (mainDur) args.push("-t", String(mainDur)); // 无限循环输入需要显式截断到底片时长
    args.push(
      "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-movflags", "+faststart", "-y", outPath,
    );

    await run(FFMPEG, args);
    res.json({ output: outPath });
  } catch (e) {
    res.status(500).json({ error: `合成失败：${e.message}`, detail: (e.stderr || "").slice(-2000) });
  }
});

module.exports = router;

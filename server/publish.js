// 半自动发布模块 — 把视频+文案自动填进抖音/视频号上传页，停在"发布"按钮前，绝不自动点击。
// 底层调用 publish-eval/social-auto-upload 的 sau_cli.py（playwright 有头浏览器）。
// 产品红线：本模块永远不点发布，浏览器停在发布页等人工确认。
const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const router = express.Router();

// social-auto-upload 仓库位置（可用 SAU_DIR 环境变量覆盖）。
const SAU_DIR =
  process.env.SAU_DIR || path.join(os.homedir(), "Projects", "publish-eval", "social-auto-upload");
// 固定账号名：cookie 存在 SAU_DIR/cookies/<cliPlatform>_<ACCOUNT>.json
const ACCOUNT = process.env.SAU_ACCOUNT || "default";
// 日志目录（creator-os/logs）。
const LOG_DIR = path.join(__dirname, "..", "logs");
fs.mkdirSync(LOG_DIR, { recursive: true });

// 前端平台名 → sau_cli 子命令名。小红书太脆，不接。
const PLATFORM_MAP = { douyin: "douyin", shipinhao: "tencent" };

function resolvePlatform(platform) {
  const cli = PLATFORM_MAP[platform];
  if (!cli) return null;
  return { front: platform, cli };
}

function logPath(front) {
  return path.join(LOG_DIR, `publish_${front}.log`);
}

function cookiePath(cli) {
  return path.join(SAU_DIR, "cookies", `${cli}_${ACCOUNT}.json`);
}

// 用参数数组 spawn，避免中文/空格拼 shell 字符串导致的转义问题。stdout/stderr 追加到日志文件。
function spawnSau(args, front, tag) {
  const logFile = logPath(front);
  const stamp = `\n===== [${tag}] ${new Date().toISOString()} =====\ncmd: uv run python sau_cli.py ${args.join(" ")}\n`;
  fs.appendFileSync(logFile, stamp);
  const out = fs.openSync(logFile, "a");
  const child = spawn("uv", ["run", "python", "sau_cli.py", ...args], {
    cwd: SAU_DIR,
    stdio: ["ignore", out, out],
    detached: false,
  });
  child.on("close", (code) => {
    try {
      fs.appendFileSync(logFile, `\n===== [${tag}] exit code=${code} @ ${new Date().toISOString()} =====\n`);
    } catch (_) {}
  });
  return child;
}

function tailLog(front, n = 20) {
  const p = logPath(front);
  if (!fs.existsSync(p)) return "";
  const lines = fs.readFileSync(p, "utf8").split("\n");
  return lines.slice(Math.max(0, lines.length - n)).join("\n");
}

// POST /prefill — 半自动填充：拉起有头浏览器把视频+文案填进上传页，停在发布按钮前。
// 入参 { platform, videoPath, title, desc, tags:[] }，立即返回 { started:true }。
router.post("/prefill", (req, res) => {
  const { platform, videoPath, title, desc, tags } = req.body || {};
  const resolved = resolvePlatform(platform);
  if (!resolved) return res.status(400).json({ error: `不支持的平台: ${platform}（仅 douyin / shipinhao）` });
  if (!videoPath) return res.status(400).json({ error: "缺少 videoPath" });
  if (!title) return res.status(400).json({ error: "缺少 title" });
  if (!fs.existsSync(videoPath)) return res.status(400).json({ error: `视频文件不存在: ${videoPath}` });
  if (!fs.existsSync(cookiePath(resolved.cli))) {
    return res.status(409).json({ error: `${platform} 尚未登录，请先调用 /login 扫码`, needLogin: true });
  }

  const args = [
    resolved.cli,
    "upload-video",
    "--account",
    ACCOUNT,
    "--file",
    videoPath,
    "--title",
    title,
  ];
  // sau_cli 的 upload-video 支持 --desc；有 desc 就单独传，不并进 title。
  if (desc) args.push("--desc", desc);
  if (Array.isArray(tags) && tags.length) args.push("--tags", tags.join(","));
  args.push("--headed"); // 必须有头，人工才能看到并点发布

  const child = spawnSau(args, resolved.front, "prefill");
  res.json({ started: true, platform, pid: child.pid, log: logPath(resolved.front) });
});

// GET /status/:platform — 该平台是否已有 cookie + 最近日志尾 20 行。
router.get("/status/:platform", (req, res) => {
  const resolved = resolvePlatform(req.params.platform);
  if (!resolved) return res.status(400).json({ error: `不支持的平台: ${req.params.platform}` });
  res.json({
    platform: resolved.front,
    loggedIn: fs.existsSync(cookiePath(resolved.cli)),
    cookieFile: cookiePath(resolved.cli),
    logTail: tailLog(resolved.front, 20),
  });
});

// POST /login — 拉起有头登录流程，用户扫码。入参 { platform }，立即返回。
router.post("/login", (req, res) => {
  const { platform } = req.body || {};
  const resolved = resolvePlatform(platform);
  if (!resolved) return res.status(400).json({ error: `不支持的平台: ${platform}（仅 douyin / shipinhao）` });

  const args = [resolved.cli, "login", "--account", ACCOUNT, "--headed"];
  const child = spawnSau(args, resolved.front, "login");
  res.json({ started: true, platform, pid: child.pid, hint: "请在弹出的浏览器里扫码登录", log: logPath(resolved.front) });
});

module.exports = router;

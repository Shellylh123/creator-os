// LLM 运行器：通过本机 claude CLI 调用模型，返回解析后的 JSON。
// 模块的"大脑"= prompts.js 里的提示词；这里只负责跑和解析。
const { spawn } = require("child_process");

function runClaude(prompt, { timeoutMs = 180000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", ["-p", "--output-format", "text"], {
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });
    let out = "", err = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("LLM 调用超时"));
    }, timeoutMs);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(`claude CLI 退出码 ${code}: ${err.slice(0, 500)}`));
      resolve(out.trim());
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

// 从模型输出里宽容地抠出 JSON（容忍代码块围栏和前后废话）
function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("模型输出中未找到 JSON");
  return JSON.parse(candidate.slice(start, end + 1));
}

async function runModule(prompt) {
  const raw = await runClaude(prompt);
  return extractJson(raw);
}

module.exports = { runClaude, runModule };

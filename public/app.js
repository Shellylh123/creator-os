// Creator OS 前端 — 模块化：每个工具既是流水线工位，也可单独使用。
const $ = (s) => document.querySelector(s);
const main = $("#main");

const state = {
  projects: [],
  currentProject: null, // 项目对象
  view: "tool-copypack",
};

// ---------- 基础 ----------
async function api(path, opts) {
  const r = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data.error || "请求失败") + " [" + r.status + "]");
  return data;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function copyText(text, el) {
  navigator.clipboard.writeText(text).then(() => {
    const old = el.textContent;
    el.textContent = "已复制 ✓";
    setTimeout(() => (el.textContent = old), 1200);
  });
}

// ---------- 导航 ----------
async function refreshProjects() {
  state.projects = await api("/api/projects");
  const nav = $("#projectNav");
  nav.innerHTML = state.projects
    .map((p) => {
      const st = projectStage(p);
      return `<div class="nav ${state.view === "project:" + p.id ? "active" : ""}" onclick="ui.openProject('${esc(p.id)}')"><span class="navdot"></span>${esc(p.title)}<span class="badge">${st.label}</span></div>`;
    })
    .join("");
}

function markActiveNav() {
  document.querySelectorAll(".side .nav").forEach((n) => {
    n.classList.toggle("active", n.dataset.view === state.view);
  });
}

// 项目进行到哪一站
function projectStage(p) {
  if (p.publish) return { idx: 6, label: "待发布" };
  if (p.cover) return { idx: 5, label: "文案" };
  if (p.broll || (p.footage && p.type === "koubo")) return { idx: 4, label: "封面" };
  if (p.footage) return { idx: 3, label: "剪辑" };
  if (p.script) return { idx: 2, label: "拍摄" };
  if (p.idea) return { idx: 1, label: "脚本" };
  return { idx: 0, label: "想法" };
}

// ---------- 视图渲染 ----------
const ui = {
  async show(view) {
    state.view = view;
    state.currentProject = null;
    markActiveNav();
    await refreshProjects();
    render();
  },

  async openProject(id, station) {
    state.currentProject = await api("/api/projects/" + encodeURIComponent(id));
    state.view = "project:" + id;
    state.station = station ?? projectStage(state.currentProject).idx;
    markActiveNav();
    await refreshProjects();
    render();
  },

  newProject() {
    const mask = document.createElement("div");
    mask.className = "modal-mask";
    mask.innerHTML = `<div class="modal">
      <h3>新建视频</h3>
      <div class="fld"><label>视频标题（工作用名）</label><input id="npTitle" type="text" placeholder="比如：Fable5 最后一天"></div>
      <div class="fld"><label>视频类型</label>
        <div class="typegrid">
          <div class="typecard sel" data-type="koubo"><b>纯口播</b><span>真人出镜讲述，走 ClipLab 剪辑（字幕/变速/画布）</span></div>
          <div class="typecard" data-type="knowledge"><b>知识类 · 带 B-roll</b><span>讲解中自动配画面素材（截图/录屏/实景）</span></div>
        </div>
      </div>
      <div class="row" style="justify-content:flex-end;">
        <button class="btn sm ghost" id="npCancel">取消</button>
        <button class="btn sm" id="npCreate">创建</button>
      </div>
    </div>`;
    document.body.appendChild(mask);
    mask.querySelectorAll(".typecard").forEach((c) => c.addEventListener("click", () => {
      mask.querySelectorAll(".typecard").forEach((x) => x.classList.remove("sel"));
      c.classList.add("sel");
    }));
    const close = () => mask.remove();
    mask.addEventListener("click", (e) => { if (e.target === mask) close(); });
    mask.querySelector("#npCancel").addEventListener("click", close);
    mask.querySelector("#npTitle").focus();
    mask.querySelector("#npCreate").addEventListener("click", async () => {
      const title = mask.querySelector("#npTitle").value.trim();
      if (!title) return mask.querySelector("#npTitle").focus();
      const type = mask.querySelector(".typecard.sel").dataset.type;
      await api("/api/projects", { method: "POST", body: JSON.stringify({ title, type }) });
      close();
      await ui.openProject(title, 0);
    });
  },
};

function render() {
  if (state.view.startsWith("project:")) return renderProject();
  const map = {
    "tool-script": renderScriptTool,
    "tool-broll": renderBrollTool,
    "tool-cover": renderCoverTool,
    "tool-copypack": renderCopypackTool,
    "tool-publish": renderPublishTool,
    "tool-insights": renderInsights,
  };
  (map[state.view] || renderCopypackTool)();
}

// ---------- 项目（流水线）视图 ----------
const STATIONS = ["想法", "脚本", "拍摄", "剪辑", "封面", "文案", "发布"];

function renderProject() {
  const p = state.currentProject;
  const stage = projectStage(p).idx;
  const cur = state.station ?? stage;
  const typeLabel = p.type === "knowledge" ? "知识类 · 带B-roll" : "纯口播";

  main.innerHTML = `
    <div class="crumb">流水线 / ${esc(p.title)}</div>
    <h1>${esc(p.title)} <span class="chip">${typeLabel}</span></h1>
    <div class="desc">产物自动从上一站流到下一站，每站等你确认放行。点工位切换。</div>
    <div class="card">
      <div class="line">
        ${STATIONS.map((s, i) => {
          const cls = i < stage ? "done" : i === cur ? "current" : "pending";
          return `<div class="station ${cls}" onclick="ui.openProject('${esc(p.id)}', ${i})">
            <div class="dot">${i < stage ? "✓" : i + 1}</div><div class="sname">${s}</div></div>`;
        }).join("")}
      </div>
    </div>
    <div id="stationPanel"></div>`;

  const panel = $("#stationPanel");
  const renderers = [renderIdeaStation, renderScriptStation, renderFootageStation, renderEditStation, renderCoverStation, renderCopyStation, renderPublishStation];
  renderers[cur](panel, p);

  const nav = document.createElement("div");
  nav.className = "row";
  nav.innerHTML = `${cur > 0 ? `<button class="btn sm ghost" onclick="ui.openProject('${esc(p.id)}', ${cur - 1})">← 上一步</button>` : ""}
    ${cur < 6 ? `<button class="btn sm ghost" onclick="ui.openProject('${esc(p.id)}', ${cur + 1})">下一步 →</button>` : ""}
    <span class="t-xs t-faint">工位可任意点选，随时回上一步改；封面与剪辑可并行做</span>`;
  panel.appendChild(nav);
}

// 工位① 想法
function renderIdeaStation(el, p) {
  el.innerHTML = `<div class="card">
    <h4 style="margin-bottom:10px;">① 想法输入 — 口述或粘贴你的原始想法</h4>
    <textarea id="ideaInput" placeholder="语音转文字直接贴进来，有错别字没关系…">${esc(p.idea || "")}</textarea>
    <div class="row">
      <button class="btn" onclick="runScriptModule('${esc(p.id)}')">交给脚本 Agent 优化</button>
      <span id="mstatus"></span>
    </div></div>`;
}

// 工位② 脚本
function renderScriptStation(el, p) {
  if (!p.script) return renderIdeaStation(el, p);
  const s = p.script;
  el.innerHTML = `<div class="card">
    <h4 style="margin-bottom:12px;">② 脚本优化 — 对照确认，可直接改右栏</h4>
    <div class="compare">
      <div><h4>你的口述原稿</h4><div class="out">${esc(p.idea || "（无）")}</div></div>
      <div><h4>优化稿 · 《${esc(s.title)}》 · 预计 ${esc(s.duration_est)}s</h4>
        <div class="scriptbox" contenteditable="true" id="scriptEdit">${esc(s.script)}</div>
        <div class="t-xs t-warn" style="margin-top:8px;">拍摄提示：${esc(s.notes || "")}</div></div>
    </div>
    <div class="row">
      <button class="btn ghost" onclick="runScriptModule('${esc(p.id)}')">↻ 重新生成</button>
      <button class="btn" onclick="confirmScript('${esc(p.id)}')">确认脚本，进入拍摄 →</button>
      <span id="mstatus"></span>
    </div></div>`;
}

// 工位③ 拍摄/上传
function renderFootageStation(el, p) {
  const f = p.footage || {};
  el.innerHTML = `<div class="card">
    <h4 style="margin-bottom:10px;">③ 拍摄 & 素材登记</h4>
    <div class="t-sm t-muted" style="margin-bottom:10px;">拍好的视频文件：</div>
    <div class="row" style="margin:0 0 8px;">
      <input type="text" id="footagePath" placeholder="点右边按钮选择视频文件…" value="${esc(f.path || "")}" style="flex:1;">
      <button class="btn sm ghost" onclick="pickFile('footagePath','选择视频文件')">选择文件</button>
    </div>
    <div class="t-sm t-muted" style="margin:14px 0 8px;">转录稿（可选——只有知识类配 B-roll 时需要。有字幕文件就点导入，没有可以先跳过）：</div>
    <div class="row" style="margin:0 0 8px;">
      <button class="btn sm ghost" onclick="importSrt()">导入 SRT 字幕文件</button>
      <span class="t-xs t-faint">用 ClipLab 剪辑会自动产出字幕；外部视频可上传自己的 SRT</span>
    </div>
    <textarea id="transcriptInput" style="min-height:120px;" placeholder="[12.4-15.8] 今天是 Fable5 的最后一天…（可留空）">${esc(f.transcript || "")}</textarea>
    <div class="row"><button class="btn" onclick="saveFootage('${esc(p.id)}')">登记完成，进入剪辑 →</button><span id="mstatus"></span></div>
  </div>`;
}

async function pickFile(inputId, prompt) {
  const r = await api("/api/pickfile", { method: "POST", body: JSON.stringify({ prompt }) });
  if (r.path) $("#" + inputId).value = r.path;
}

async function importSrt() {
  const r = await api("/api/pickfile", { method: "POST", body: JSON.stringify({ prompt: "选择 SRT 字幕文件" }) });
  if (!r.path) return;
  try {
    const t = await api("/api/srt2transcript", { method: "POST", body: JSON.stringify({ path: r.path }) });
    $("#transcriptInput").value = t.transcript;
  } catch (e) { setStatus(`<span class="err">${esc(e.message)}</span>`); }
}

// 工位④ 剪辑
function renderEditStation(el, p) {
  if (p.type !== "knowledge") {
    el.innerHTML = `<div class="card"><h4 style="margin-bottom:10px;">④ 剪辑 — 纯口播 <span class="agentpill">ClipLab 引擎</span></h4>
      <div class="t-sm t-muted" style="margin:4px 0 4px;">一键启动预处理（画面归一化 + 语音转录 + AI 断句，约 5-8 分钟无人值守），完成后日志里会给出审核页地址，勾删改字后一次编码直出成片。</div>
      <div class="row">
        <button class="btn" ${(p.footage || {}).path ? "" : "disabled"} onclick="runCliplabPrep('${esc(p.id)}')">启动 ClipLab 预处理</button>
        <button class="btn sm ghost" onclick="refreshCliplabLog()">刷新进度</button>
        <span id="mstatus"></span>
      </div>
      <pre id="cliplabLog" class="t-xs t-faint" style="margin-top:12px;white-space:pre-wrap;max-height:200px;overflow:auto;"></pre>
      <div class="row"><button class="btn ghost" onclick="ui.openProject('${esc(p.id)}', 4)">剪辑已完成，进入封面 →</button></div></div>`;
    return;
  }
  const transcript = (p.footage || {}).transcript;
  const b = p.broll;
  const hasCands = b && (b.points || []).some((pt) => (pt.candidates || []).length);
  const rendered = p.rendered || (b && b.rendered_path);
  el.innerHTML = `<div class="card">
    <h4 style="margin-bottom:10px;">④ 剪辑 — 知识类 · B-roll <span class="agentpill">剪辑 Agent</span></h4>
    ${transcript ? "" : `<div class="err">还没有转录稿，请先回③登记。</div>`}
    <div class="row" style="margin-top:4px;">
      <button class="btn ${b ? "ghost" : ""}" ${transcript ? "" : "disabled"} onclick="runBrollModule('${esc(p.id)}')">${b ? "重新标注" : "标注 B-roll 插入点"}</button>
      ${b ? `<button class="btn ${hasCands ? "ghost" : ""}" onclick="runBrollSearch('${esc(p.id)}')">${hasCands ? "重搜素材" : "搜索素材候选"}</button>` : ""}
      ${hasCands ? `<button class="btn" onclick="runBrollRender('${esc(p.id)}')">下载所选并合成</button>` : ""}
      <span id="mstatus"></span>
    </div>
    <div id="brollList" style="margin-top:16px;">${b ? brollListHtml(b) : ""}</div>
    <div id="renderOut">${rendered ? renderedHtml(p.id) : ""}</div>
    ${b ? `<div class="row"><button class="btn ghost" onclick="ui.openProject('${esc(p.id)}', 4)">进入封面 →</button></div>` : ""}
  </div>`;
}

function renderedHtml(projectId) {
  return `<div style="margin-top:18px;">
    <h4 style="margin-bottom:10px;">合成结果</h4>
    <video controls style="width:300px;border-radius:14px;background:#000;" src="/workspace/${encodeURIComponent((state.currentProject.dirName || projectId).replace(/[^\w一-龥-]/g, "_"))}/final_broll.mp4?t=${Date.now()}"></video>
  </div>`;
}

function brollListHtml(b) {
  return (b.points || [])
    .map((pt, i) => {
      const cands = pt.candidates || [];
      const defMode = pt.type === "footage" ? "full" : "pip";
      return `<div class="brollpoint" data-i="${i}">
      <div class="brollitem"><input type="checkbox" class="bp-on" checked>
        <span class="time">${pt.start}s-${pt.end}s</span>
        <span class="type">${esc(pt.type)}</span>
        <span>${esc(pt.desc)}</span>
        <span class="kw">${esc(pt.search_en)}</span>
        ${cands.length ? `<select class="bp-mode">
          <option value="pip" ${defMode === "pip" ? "selected" : ""}>画中画</option>
          <option value="full" ${defMode === "full" ? "selected" : ""}>全屏</option>
        </select>` : ""}
      </div>
      ${cands.length ? `<div class="cands">${cands.map((c, j) => `<img class="cand ${j === 0 ? "sel" : ""}" src="${esc(c.thumb_url)}" data-j="${j}" title="${esc(c.source)} · ${c.width}x${c.height}" onclick="selectCand(this)">`).join("")}</div>` : ""}
    </div>`;
    })
    .join("");
}

async function runCliplabPrep(projectId) {
  const p = state.currentProject;
  setStatus('<span class="spinner">正在启动预处理…</span>');
  try {
    await api("/api/cliplab/prep", { method: "POST", body: JSON.stringify({ videoPath: (p.footage || {}).path }) });
    setStatus("已启动（后台运行，防睡眠已开）。点「刷新进度」看日志。");
    refreshCliplabLog();
  } catch (e) { setStatus(`<span class="err">${esc(e.message)}</span>`); }
}

async function refreshCliplabLog() {
  const r = await api("/api/cliplab/log");
  const el = document.getElementById("cliplabLog");
  if (el) el.textContent = r.tail;
  const m = (r.tail || "").match(/Review URL: (http\S+)/);
  if (m) setStatus(`预处理完成 → <a href="${m[1]}" target="_blank" style="color:var(--lav);font-weight:500;">打开审核页</a>（勾删改字，然后执行剪辑出片）`);
}

function selectCand(img) {
  img.parentElement.querySelectorAll(".cand").forEach((c) => c.classList.remove("sel"));
  img.classList.add("sel");
}

async function runBrollSearch(projectId) {
  const b = state.currentProject.broll;
  if (!b) return;
  setStatus('<span class="spinner">正在素材库检索候选…</span>');
  try {
    const r = await api("/api/broll/search", { method: "POST", body: JSON.stringify({ points: b.points, projectId }) });
    state.currentProject.broll = r;
    renderProject();
  } catch (e) { setStatus(`<span class="err">${esc(e.message)}</span>`); }
}

async function runBrollRender(projectId) {
  const p = state.currentProject;
  const videoPath = (p.footage || {}).path;
  if (!videoPath) return setStatus('<span class="err">③里还没登记视频文件，先回上一步选择</span>');
  const items = [];
  document.querySelectorAll(".brollpoint").forEach((el) => {
    if (!el.querySelector(".bp-on").checked) return;
    const i = Number(el.dataset.i);
    const pt = p.broll.points[i];
    const selImg = el.querySelector(".cand.sel");
    if (!pt || !selImg) return;
    const c = pt.candidates[Number(selImg.dataset.j)];
    items.push({ point: pt, cand: c, mode: el.querySelector(".bp-mode").value });
  });
  if (!items.length) return setStatus('<span class="err">没有勾选任何素材点</span>');
  setStatus('<span class="spinner">下载素材并合成中（约 1-2 分钟）…</span>');
  try {
    const assets = [];
    for (const it of items) {
      const ext = it.cand.duration ? "mp4" : "jpg";
      const d = await api("/api/broll/download", { method: "POST", body: JSON.stringify({ url: it.cand.download_url, dest_name: `p${it.point.start}_${it.cand.id}.${ext}`, projectId }) });
      assets.push({ start: it.point.start, end: it.point.end, assetPath: d.assetPath, mode: it.mode });
    }
    await api("/api/broll/render", { method: "POST", body: JSON.stringify({ videoPath, items: assets, projectId }) });
    state.currentProject.broll.rendered_path = true;
    setStatus("");
    renderProject();
  } catch (e) { setStatus(`<span class="err">${esc(e.message)}</span>`); }
}

// 工位⑤ 封面
function renderCoverStation(el, p) {
  const cover = (p.publish || {}).cover;
  el.innerHTML = `<div class="card">
    <h4 style="margin-bottom:10px;">⑤ 封面 — CoverLab 封面工厂（已上线的自家工具）</h4>
    ${cover ? `<div class="out" style="margin-bottom:12px;">AI 建议 · 大标题：<b>${esc(cover.main_title)}</b>　小标题：${esc(cover.sub_title)}<br>备选：${(cover.alt_titles || []).map(esc).join(" / ")}</div>` : `<div style="font-size:13px;color:var(--ink-subtle);margin-bottom:12px;">（先跑⑥文案 Agent 可得到封面标题建议）</div>`}
    <iframe class="coverlab" src="https://cover-factory-web.vercel.app"></iframe>
    <div class="row"><button class="btn" onclick="ui.openProject('${esc(p.id)}', 5)">封面已出，进入文案 →</button></div>
  </div>`;
}

// 工位⑥ 文案
function renderCopyStation(el, p) {
  const script = (p.script || {}).script || (p.footage || {}).transcript;
  el.innerHTML = `<div class="card">
    <h4 style="margin-bottom:10px;">⑥ 发布文案包 <span class="agentpill">文案 Agent</span></h4>
    ${script ? "" : `<div class="err">没有脚本或转录稿，请先完成前面步骤。</div>`}
    <div class="row" style="margin-top:4px;">
      <button class="btn" ${script ? "" : "disabled"} onclick="runCopypackModule('${esc(p.id)}')">生成三平台文案包</button>
      <span id="mstatus"></span>
    </div>
    <div id="packOut" style="margin-top:6px;">${p.publish ? packHtml(p.publish, p.id) : ""}</div>
    ${p.publish ? `<div class="row"><button class="btn" onclick="ui.openProject('${esc(p.id)}', 6)">文案 OK，去发布台 →</button></div>` : ""}
  </div>`;
}

// 工位⑦ 发布台
function renderPublishStation(el, p) {
  el.innerHTML = publishDeckHtml(p.publish, (p.footage || {}).path);
}

// ---------- 独立工具视图 ----------
function toolShell(crumb, title, chip, desc, inner) {
  main.innerHTML = `<div class="crumb">工具箱 / ${crumb}</div>
    <h1>${title} <span class="chip">可独立使用</span>${chip || ""}</h1>
    <div class="desc">${desc}</div>${inner}`;
}

function renderScriptTool() {
  toolShell("脚本优化", `<span class="tile lav"><svg class="ic"><use href="#i-edit"/></svg></span>脚本优化`, "", "口述想法进来，可拍摄的口播稿出去。不需要走完整流水线。", `
    <div class="card">
      <textarea id="ideaInput" placeholder="语音转文字直接贴进来，有错别字没关系…"></textarea>
      <div class="row"><button class="btn" onclick="runScriptModule(null)">优化成口播稿</button><span id="mstatus"></span></div>
      <div id="scriptOut" style="margin-top:16px;"></div>
    </div>`);
}

function renderBrollTool() {
  toolShell("B-roll 策划", `<span class="tile peach"><svg class="ic"><use href="#i-film"/></svg></span>B-roll 策划`, "", "贴一份带时间戳的转录稿，AI 标出该配画面的位置和搜索词。", `
    <div class="card">
      <textarea id="transcriptInput" style="min-height:150px;" placeholder="[12.4-15.8] 今天是 Fable5 的最后一天…"></textarea>
      <div class="row"><button class="btn" onclick="runBrollModule(null)">标注 B-roll 插入点</button><span id="mstatus"></span></div>
      <div id="brollList" style="margin-top:16px;"></div>
    </div>`);
}

function renderCoverTool() {
  toolShell("封面工厂", `<span class="tile sky"><svg class="ic"><use href="#i-image"/></svg></span>封面工厂`, "", "自家 CoverLab：真实照片抠图 + 固化模板，秒出 3:4 封面，无 AI 生图成分。", `
    <iframe class="coverlab" src="https://cover-factory-web.vercel.app"></iframe>`);
}

function renderCopypackTool() {
  toolShell("文案包", `<span class="tile mint"><svg class="ic"><use href="#i-layers"/></svg></span>文案包`, "", "给我一份脚本或转录稿，一次出齐三平台发布文案。", `
    <div class="card">
      <textarea id="scriptInput" placeholder="粘贴口播稿或转录稿…"></textarea>
      <div class="row"><button class="btn" onclick="runCopypackModule(null)">生成文案包</button><span id="mstatus"></span></div>
      <div id="packOut" style="margin-top:6px;"></div>
    </div>`);
}

function renderPublishTool() {
  toolShell("发布台", `<span class="tile rose"><svg class="ic"><use href="#i-send"/></svg></span>发布台`, "", "三平台上传页一键直达，文案一键复制。发布按钮永远由你来点。", publishDeckHtml(lastPack, null));
}

function renderInsights() {
  toolShell("数据复盘", `<span class="tile lav"><svg class="ic"><use href="#i-chart"/></svg></span>数据复盘`, `<span class="chip dim">roadmap</span>`, "发布后回收播放/互动数据 → 复盘 → 校准 AI 的选题与打分标准。", `
    <div class="card"><div class="out">这是 Creator OS 的核心壁垒（已在命令行版跑通，UI 化排期中）：<br><br>
    01 · 发布前：AI 对每条内容做<b>盲预测</b>（7 维打分，写入不可篡改的预测日志）<br>
    02 · T+3 天：抓取真实数据，和预测对账<br>
    03 · 差距写回评分标准 → <b>AI 越用越懂你的账号</b><br><br>
    每个创作者的校准数据是自己独有的资产 —— 这就是"模板任何人可用，但每个人的 Creator OS 独一无二"的原因。</div></div>`);
}

// ---------- 发布台 ----------
let lastPack = null; // 最近一次文案包结果（独立工具模式下共享给发布台）

const PLATFORMS = [
  { key: "xiaohongshu", name: `<span class="pdot" style="background:#ff2442"></span>小红书`, auto: false, url: "https://creator.xiaohongshu.com/publish/publish", get: (pk) => pk ? `${pk.xiaohongshu.title}\n\n${pk.xiaohongshu.body}\n\n${(pk.xiaohongshu.tags || []).map((t) => "#" + t).join(" ")}` : "" },
  { key: "douyin", name: `<span class="pdot" style="background:#1d1d1f"></span>抖音`, auto: true, url: "https://creator.douyin.com/creator-micro/content/upload", get: (pk) => pk ? `${pk.douyin.title}\n${(pk.douyin.tags || []).map((t) => "#" + t).join(" ")}` : "" },
  { key: "shipinhao", name: `<span class="pdot" style="background:#fa9d3b"></span>视频号`, auto: true, url: "https://channels.weixin.qq.com/platform/post/create", get: (pk) => pk ? `${(pk.shipinhao && pk.shipinhao.title) || pk.douyin.title}` : "" },
];

function publishDeckHtml(pack, videoPath) {
  window._deckCtx = { pack, videoPath };
  return `<div class="pubgrid">
    ${PLATFORMS.map((pl) => {
      const text = pack ? pl.get(pack) : "";
      const canAuto = pl.auto && pack && videoPath;
      return `<div class="pubcard">
        <h3>${pl.name}</h3>
        <div class="content">${text ? esc(text) : '<span style="color:var(--ink-faint);">（先在文案包工具生成文案）</span>'}</div>
        <div class="row">
          <button class="btn sm ghost" ${text ? "" : "disabled"} onclick="copyText(${JSON.stringify(text).replace(/"/g, "&quot;")}, this)">复制文案</button>
          ${pl.auto ? `<button class="btn sm" ${canAuto ? "" : "disabled"} title="${canAuto ? "" : "自动填充需要文案+成片路径（走流水线项目）"}" onclick="prefillPublish('${pl.key}')">自动填充上传</button>` : ""}
          <button class="btn sm ${pl.auto ? "ghost" : ""}" onclick="window.open('${pl.url}','_blank')">打开上传页 ↗</button>
        </div>
        <div class="t-xs t-faint" id="pubstatus-${pl.key}" style="margin-top:8px;"></div></div>`;
    }).join("")}
  </div>
  ${videoPath ? `<div class="card" style="margin-top:16px;"><b style="font-size:13.5px;">成片文件</b>
    <div class="row"><span style="font-size:13px;color:var(--ink-subtle);">${esc(videoPath)}</span>
    <button class="btn sm ghost" onclick="copyText('${esc(videoPath)}', this)">复制路径</button></div></div>` : ""}
  <div class="steps-note">半自动发布：Agent 备好一切（成片/文案/标签）——<b>发布按钮永远由你来点</b>。<br>
  说明：「自动填充上传」用的是独立的自动化浏览器（和你平时的 Chrome 不是同一个），首次使用需在<b>弹出的那个窗口里</b>扫码登录一次，之后不用再扫；「打开上传页」则是在你自己的浏览器里打开，两者登录状态互不相通。自动填充需要成片+文案，请从流水线项目的发布工位使用。</div>`;
}

// ---------- 半自动发布 ----------
async function prefillPublish(platform) {
  const ctx = window._deckCtx || {};
  const pk = ctx.pack;
  if (!pk || !ctx.videoPath) return;
  const st = document.getElementById("pubstatus-" + platform);
  if (!st) return;
  st.textContent = "正在拉起浏览器自动填充…";
  try {
    await api("/api/publish/prefill", { method: "POST", body: JSON.stringify({
      platform,
      videoPath: ctx.videoPath,
      title: pk.douyin.title,
      desc: pk.xiaohongshu.body,
      tags: pk.douyin.tags || [],
    }) });
    st.textContent = "浏览器已拉起：视频与文案自动填充中，填完会停在发布页——请核对后亲手点发布。";
  } catch (e) {
    if (/needLogin|409/.test(e.message)) {
      st.innerHTML = `还没登录过该平台。<a href="#" onclick="loginPublish('${platform}');return false;" style="color:var(--lav);">点这里扫码登录一次</a>`;
    } else {
      st.textContent = "失败：" + e.message;
    }
  }
}

async function loginPublish(platform) {
  const st = document.getElementById("pubstatus-" + platform);
  if (!st) return;
  st.textContent = "正在拉起登录浏览器，请用手机 App 扫码…";
  try {
    await api("/api/publish/login", { method: "POST", body: JSON.stringify({ platform }) });
    st.textContent = "扫码窗口已打开。扫码成功后回来再点「自动填充上传」。";
  } catch (e) { st.textContent = "失败：" + e.message; }
}

// ---------- 模块调用 ----------
function setStatus(html) {
  const el = $("#mstatus");
  if (el) el.innerHTML = html;
}

// 写入可能已随视图切换消失的元素：找不到就静默跳过，不抛错
function setHTML(sel, html) {
  const el = $(sel);
  if (el) el.innerHTML = html;
}

async function runScriptModule(projectId) {
  const idea = $("#ideaInput").value.trim();
  if (!idea) return setStatus('<span class="err">先输入想法再点优化</span>');
  setStatus('<span class="spinner">脚本 Agent 思考中…</span>');
  try {
    const r = await api("/api/module/script", { method: "POST", body: JSON.stringify({ idea, projectId }) });
    if (projectId) return ui.openProject(projectId, 1);
    setHTML("#scriptOut", `<div class="scriptbox"><b>《${esc(r.title)}》</b> · 预计 ${esc(r.duration_est)}s\n\n${esc(r.script)}\n\n拍摄提示：${esc(r.notes || "")}</div>`);
    setStatus("");
  } catch (e) { setStatus(`<span class="err">${esc(e.message)}</span>`); }
}

async function confirmScript(projectId) {
  const edited = $("#scriptEdit").innerText;
  const p = state.currentProject;
  const updated = { ...p.script, script: edited };
  await api(`/api/projects/${encodeURIComponent(projectId)}/artifact/script`, { method: "POST", body: JSON.stringify({ content: updated }) });
  ui.openProject(projectId, 2);
}

async function saveFootage(projectId) {
  const content = { path: $("#footagePath").value.trim(), transcript: $("#transcriptInput").value.trim() };
  await api(`/api/projects/${encodeURIComponent(projectId)}/artifact/footage`, { method: "POST", body: JSON.stringify({ content }) });
  ui.openProject(projectId, 3);
}

async function runBrollModule(projectId) {
  const transcript = projectId ? (state.currentProject.footage || {}).transcript : $("#transcriptInput").value.trim();
  if (!transcript) return setStatus('<span class="err">没有转录稿——先在③导入 SRT 或粘贴</span>');
  setStatus('<span class="spinner">剪辑 Agent 分析中…</span>');
  try {
    const r = await api("/api/module/broll", { method: "POST", body: JSON.stringify({ transcript, projectId }) });
    setHTML("#brollList", brollListHtml(r));
    setStatus("");
    if (projectId) state.currentProject.broll = r;
  } catch (e) { setStatus(`<span class="err">${esc(e.message)}</span>`); }
}

function packHtml(pk, projectId) {
  window._packData = pk;
  window._packProject = projectId || null;
  const x = pk.x || {};
  const sp = pk.shipinhao || {};
  const fld = (label, path, val, rows = 2) =>
    `<div class="fld"><label>${label}</label><textarea data-f="${path}" rows="${rows}">${esc(val ?? "")}</textarea></div>`;
  return `<div class="outgrid" id="packForm">
    <div class="out"><h4><span class="pdot" style="background:#ff2442;margin-right:6px;"></span>小红书</h4>
      ${fld("标题", "xiaohongshu.title", pk.xiaohongshu.title, 1)}
      ${fld("正文", "xiaohongshu.body", pk.xiaohongshu.body, 6)}
      ${fld("标签", "xiaohongshu.tags", (pk.xiaohongshu.tags || []).map((t) => "#" + t).join(" "), 1)}
    </div>
    <div class="out"><h4><span class="pdot" style="background:#1d1d1f;margin-right:6px;"></span>抖音 · <span class="pdot" style="background:#fa9d3b;margin:0 6px;"></span>视频号</h4>
      ${fld("抖音标题", "douyin.title", pk.douyin.title, 1)}
      ${fld("抖音标签", "douyin.tags", (pk.douyin.tags || []).map((t) => "#" + t).join(" "), 1)}
      ${fld("视频号标题", "shipinhao.title", sp.title || pk.douyin.title, 1)}
    </div>
    <div class="out"><h4><span class="pdot" style="background:#3579d6;margin-right:6px;"></span>X · 引流推文</h4>
      ${fld("中文", "x.post_zh", x.post_zh || x.thread_zh || "", 3)}
      ${fld("English", "x.post_en", x.post_en || x.post || "", 3)}
    </div>
    <div class="out"><h4><span class="pdot" style="background:#9d7bf5;margin-right:6px;"></span>封面标题</h4>
      ${fld("大标题", "cover.main_title", pk.cover.main_title, 1)}
      ${fld("小标题", "cover.sub_title", pk.cover.sub_title, 1)}
      <div class="t-xs t-faint" style="margin-top:6px;">备选：${(pk.cover.alt_titles || []).map(esc).join(" / ")}</div>
    </div>
  </div>
  <div class="row"><button class="btn sm" onclick="savePack()">保存修改</button><span class="t-xs t-faint" id="packSaveStatus"></span></div>`;
}

async function savePack() {
  const pk = window._packData;
  document.querySelectorAll("#packForm [data-f]").forEach((el) => {
    const keys = el.dataset.f.split(".");
    let v = el.value;
    if (keys[1] === "tags") v = v.split(/[\s,，#]+/).filter(Boolean);
    let o = pk;
    for (let i = 0; i < keys.length - 1; i++) { o[keys[i]] = o[keys[i]] || {}; o = o[keys[i]]; }
    o[keys[keys.length - 1]] = v;
  });
  lastPack = pk;
  if (window._packProject) {
    await api(`/api/projects/${encodeURIComponent(window._packProject)}/artifact/publish`, { method: "POST", body: JSON.stringify({ content: pk }) });
    if (state.currentProject) state.currentProject.publish = pk;
  }
  const st = document.getElementById("packSaveStatus");
  st.textContent = "已保存 ✓";
  setTimeout(() => (st.textContent = ""), 1500);
}

async function runCopypackModule(projectId) {
  const script = projectId
    ? ((state.currentProject.script || {}).script || (state.currentProject.footage || {}).transcript)
    : $("#scriptInput").value.trim();
  if (!script) return alert("没有脚本内容");
  setStatus('<span class="spinner">文案 Agent 写作中…</span>');
  try {
    const r = await api("/api/module/copypack", { method: "POST", body: JSON.stringify({ script, title: projectId || "", projectId }) });
    lastPack = r;
    setHTML("#packOut", packHtml(r, projectId));
    setStatus("");
    if (projectId) { state.currentProject.publish = r; renderProject(); }
  } catch (e) { setStatus(`<span class="err">${esc(e.message)}</span>`); }
}

// ---------- 启动 ----------
(async function init() {
  await refreshProjects();
  ui.show("tool-copypack");
})();

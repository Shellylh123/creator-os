// Creator OS 前端 — 模块化：每个工具既是流水线工位，也可单独使用。
// i18n：所有界面文案走 I18N 词典，右下角可切换 EN/中文。
const $ = (s) => document.querySelector(s);
const main = $("#main");

// ---------- i18n ----------
const I18N = {
  en: {
    tagline: "Your One-Person Media Company",
    navPipelines: "Pipelines", navToolbox: "Toolbox", navNew: "New video",
    navScript: "Script Studio", navBroll: "Video Editing", navCover: "Cover Factory",
    laneKoubo: "Talking-head editing", laneBroll: "B-roll planning",
    navCopy: "Copy Pack", navPublish: "Publish Desk", navInsights: "Insights",
    stations: ["Idea", "Script", "Shoot", "Edit", "Cover", "Copy", "Publish"],
    stageReady: "Ready",
    typeKnowledge: "Knowledge · B-roll", typeKoubo: "Talking-head",
    crumbPipeline: "Pipeline", crumbToolbox: "Toolbox",
    standalone: "standalone",
    projectDesc: "Artifacts flow from station to station — each waits for your approval. Click any station to jump.",
    back: "← Back", next: "Next →",
    navHint: "Stations are freely clickable — go back anytime. Cover and Edit can run in parallel.",
    ideaHead: "01 · Idea — dictate or paste your raw idea",
    ideaPh: "Paste your voice-to-text notes here — typos are fine…",
    ideaBtn: "Send to Script Agent",
    ideaFirst: "Enter your idea first",
    scriptHead: "02 · Script — compare, edit the right panel directly",
    rawIdea: "Your raw idea", polished: "Polished", estSec: "~{n}s to deliver",
    shootNote: "Shooting note: ",
    regen: "↻ Regenerate", approveScript: "Approve script → Shoot",
    footageHead: "03 · Shoot & register footage",
    footageFile: "Your recorded video file:",
    footagePh: "Use the button to pick a video file…",
    chooseFile: "Choose file", pickVideoPrompt: "Choose a video file", pickSrtPrompt: "Choose an SRT file",
    transcriptLabel: "Transcript (optional — only needed for B-roll on knowledge videos; import an SRT or skip):",
    importSrt: "Import SRT subtitles",
    srtNote: "ClipLab editing produces subtitles automatically; for external videos import your own SRT",
    transcriptPh: "[12.4-15.8] Today is the last day of Fable 5… (can be left empty)",
    footageDone: "Done → Edit",
    editKoubo: "04 · Edit — Talking-head", cliplabEngine: "ClipLab Engine",
    cliplabDesc: "One click runs preprocessing (normalize + transcribe + AI sentence-split, ~5–8 min unattended). The log then links to a review page — tick/edit lines, and the final cut renders in one encode.",
    cliplabStart: "Start ClipLab preprocessing", cliplabRefresh: "Refresh progress",
    cliplabStarting: "Starting preprocessing…",
    cliplabStarted: "Started (background, sleep-proof). Click Refresh progress to see the log.",
    cliplabDone: (url) => `Preprocessing done → <a href="${url}" target="_blank" style="color:var(--lav);font-weight:500;">Open review page</a> (tick/edit lines, then render the cut)`,
    editDone: "Edit done → Cover",
    editKnowledge: "04 · Edit — Knowledge · B-roll", editAgent: "Edit Agent",
    noTranscript: "No transcript yet — go back to 03 and import one.",
    annotate: "Annotate B-roll points", reannotate: "Re-annotate",
    searchStock: "Search stock candidates", researchStock: "Re-search",
    downloadComposite: "Download & composite",
    compositeResult: "Composite result",
    toCover: "Next → Cover",
    pip: "PiP", full: "Full-screen",
    brollAnalyzing: "Edit Agent analyzing…",
    brollNoTranscript: "No transcript — import an SRT in 03 first",
    brollSearching: "Searching stock libraries…",
    brollNoVideo: "No video registered in 03 — go back and pick one",
    brollNoneSelected: "No B-roll points selected",
    brollRendering: "Downloading assets & compositing (~1–2 min)…",
    coverHead: "05 · Cover — CoverLab (our production tool)",
    coverSuggest: "AI suggestion · Main: ", coverSub: "Sub: ", coverAlts: "Alts: ",
    coverRunCopyFirst: "(Run 06 Copy Agent first to get cover title suggestions)",
    coverDone: "Cover done → Copy",
    copyHead: "06 · Copy Pack", copyAgent: "Copy Agent",
    copyNoScript: "No script or transcript yet — finish earlier stations first.",
    copyGen: "Generate multi-platform copy",
    copyWriting: "Copy Agent writing…", copyNoContent: "No script content",
    copyOk: "Copy OK → Publish",
    scriptThinking: "Script Agent thinking…",
    toolScriptDesc: "Raw idea in, shoot-ready script out. No pipeline required.",
    toolScriptBtn: "Polish into script",
    toolBrollDesc: "Paste a timestamped transcript — AI marks where visuals belong and what to search for.",
    toolCoverDesc: "Our CoverLab: real-photo cutouts + fixed templates. 3:4 covers in seconds, zero AI-generated imagery.",
    toolCopyDesc: "Give me a script or transcript — get publish-ready copy for every platform at once.",
    toolCopyPh: "Paste your script or transcript…",
    toolPublishDesc: "Every platform's upload page one click away, copy ready to paste. The publish button is always yours to press.",
    toolInsightsDesc: "Collect post-publish data → retro → calibrate the AI's judgment for YOUR audience.",
    insightsBody: `This is Creator OS's moat (already running in CLI form; UI on the roadmap):<br><br>
    01 · Before publishing: the AI makes a <b>blind prediction</b> (7-dimension score, immutable log)<br>
    02 · T+3 days: fetch real performance data, reconcile against the prediction<br>
    03 · The gap feeds back into the scoring rubric → <b>the AI learns your audience</b><br><br>
    Every creator's calibration data is their own asset — the template is public, but your Creator OS becomes uniquely yours.`,
    platXhs: "Xiaohongshu (RED)", platDy: "Douyin", platSph: "WeChat Channels",
    packEmpty: "(Generate copy in Copy Pack first)",
    copyBtn: "Copy text", copied: "Copied ✓",
    autofill: "Auto-fill upload", autofillNeed: "Needs copy + final video (use a pipeline project)",
    openUpload: "Open upload page ↗",
    finalVideo: "Final video", copyPath: "Copy path",
    publishNote: `Semi-automatic publishing: the Agent prepares everything — <b>the publish button is always pressed by you</b>.<br>
    Note: Auto-fill runs in a dedicated automation browser (separate from your Chrome); first use requires scanning a QR code once <b>in that window</b>. "Open upload page" uses your own browser — the two logins are independent. Auto-fill needs copy + a final video, so use it from a pipeline project.`,
    prefillStarting: "Launching automation browser…",
    prefillStarted: "Browser launched: video & copy are being filled in. It will stop on the publish page — review, then press publish yourself.",
    needLogin: (pl) => `Not logged in on this platform yet. <a href="#" onclick="loginPublish('${pl}');return false;" style="color:var(--lav);">Scan QR to log in once</a>`,
    loginStarting: "Opening login browser — scan the QR with your phone…",
    loginStarted: "Login window opened. After scanning, come back and press Auto-fill again.",
    failed: "Failed: ",
    fTitle: "Title", fBody: "Body", fTags: "Tags", fDyTitle: "Douyin title", fDyTags: "Douyin tags",
    fSphTitle: "Channels title", packX: "X · Traffic post", fZh: "Chinese", fEn: "English",
    packCover: "Cover titles", fMain: "Main", fSub: "Sub", altsLabel: "Alts: ",
    saveEdits: "Save edits", saved: "Saved ✓",
    modalNew: "New video", modalTitle: "Working title", modalTitlePh: "e.g. Fable5 Final Day",
    modalType: "Video type",
    modalKoubo: "Talking-head", modalKouboDesc: "You on camera; ClipLab editing (captions / speed / canvas)",
    modalKnow: "Knowledge · B-roll", modalKnowDesc: "Auto-matched visuals (screenshots, footage) while you explain",
    cancel: "Cancel", create: "Create",
    langBtn: "中文",
  },
  zh: {
    tagline: "一人 MCN · Your One-Person Media Company",
    navPipelines: "流水线", navToolbox: "工具箱", navNew: "新建视频",
    navScript: "脚本优化", navBroll: "视频剪辑", navCover: "封面工厂",
    laneKoubo: "口播剪辑", laneBroll: "B-roll 策划",
    navCopy: "文案包", navPublish: "发布台", navInsights: "数据复盘",
    stations: ["想法", "脚本", "拍摄", "剪辑", "封面", "文案", "发布"],
    stageReady: "待发布",
    typeKnowledge: "知识类 · 带B-roll", typeKoubo: "纯口播",
    crumbPipeline: "流水线", crumbToolbox: "工具箱",
    standalone: "可独立使用",
    projectDesc: "产物自动从上一站流到下一站，每站等你确认放行。点工位切换。",
    back: "← 上一步", next: "下一步 →",
    navHint: "工位可任意点选，随时回上一步改；封面与剪辑可并行做",
    ideaHead: "① 想法输入 — 口述或粘贴你的原始想法",
    ideaPh: "语音转文字直接贴进来，有错别字没关系…",
    ideaBtn: "交给脚本 Agent 优化",
    ideaFirst: "先输入想法再点优化",
    scriptHead: "② 脚本优化 — 对照确认，可直接改右栏",
    rawIdea: "你的口述原稿", polished: "优化稿", estSec: "预计 {n}s",
    shootNote: "拍摄提示：",
    regen: "↻ 重新生成", approveScript: "确认脚本，进入拍摄 →",
    footageHead: "③ 拍摄 & 素材登记",
    footageFile: "拍好的视频文件：",
    footagePh: "点右边按钮选择视频文件…",
    chooseFile: "选择文件", pickVideoPrompt: "选择视频文件", pickSrtPrompt: "选择 SRT 字幕文件",
    transcriptLabel: "转录稿（可选——只有知识类配 B-roll 时需要。有字幕文件就点导入，没有可以先跳过）：",
    importSrt: "导入 SRT 字幕文件",
    srtNote: "用 ClipLab 剪辑会自动产出字幕；外部视频可上传自己的 SRT",
    transcriptPh: "[12.4-15.8] 今天是 Fable5 的最后一天…（可留空）",
    footageDone: "登记完成，进入剪辑 →",
    editKoubo: "④ 剪辑 — 纯口播", cliplabEngine: "ClipLab 引擎",
    cliplabDesc: "一键启动预处理（画面归一化 + 语音转录 + AI 断句，约 5-8 分钟无人值守），完成后给出审核页链接，勾删改字后一次编码直出成片。",
    cliplabStart: "启动 ClipLab 预处理", cliplabRefresh: "刷新进度",
    cliplabStarting: "正在启动预处理…",
    cliplabStarted: "已启动（后台运行，防睡眠已开）。点「刷新进度」看日志。",
    cliplabDone: (url) => `预处理完成 → <a href="${url}" target="_blank" style="color:var(--lav);font-weight:500;">打开审核页</a>（勾删改字，然后执行剪辑出片）`,
    editDone: "剪辑已完成，进入封面 →",
    editKnowledge: "④ 剪辑 — 知识类 · B-roll", editAgent: "剪辑 Agent",
    noTranscript: "还没有转录稿，请先回③登记。",
    annotate: "标注 B-roll 插入点", reannotate: "重新标注",
    searchStock: "搜索素材候选", researchStock: "重搜素材",
    downloadComposite: "下载所选并合成",
    compositeResult: "合成结果",
    toCover: "进入封面 →",
    pip: "画中画", full: "全屏",
    brollAnalyzing: "剪辑 Agent 分析中…",
    brollNoTranscript: "没有转录稿——先在③导入 SRT 或粘贴",
    brollSearching: "正在素材库检索候选…",
    brollNoVideo: "③里还没登记视频文件，先回上一步选择",
    brollNoneSelected: "没有勾选任何素材点",
    brollRendering: "下载素材并合成中（约 1-2 分钟）…",
    coverHead: "⑤ 封面 — CoverLab 封面工厂（已上线的自家工具）",
    coverSuggest: "AI 建议 · 大标题：", coverSub: "小标题：", coverAlts: "备选：",
    coverRunCopyFirst: "（先跑⑥文案 Agent 可得到封面标题建议）",
    coverDone: "封面已出，进入文案 →",
    copyHead: "⑥ 发布文案包", copyAgent: "文案 Agent",
    copyNoScript: "没有脚本或转录稿，请先完成前面步骤。",
    copyGen: "生成三平台文案包",
    copyWriting: "文案 Agent 写作中…", copyNoContent: "没有脚本内容",
    copyOk: "文案 OK，去发布台 →",
    scriptThinking: "脚本 Agent 思考中…",
    toolScriptDesc: "口述想法进来，可拍摄的口播稿出去。不需要走完整流水线。",
    toolScriptBtn: "优化成口播稿",
    toolBrollDesc: "贴一份带时间戳的转录稿，AI 标出该配画面的位置和搜索词。",
    toolCoverDesc: "自家 CoverLab：真实照片抠图 + 固化模板，秒出 3:4 封面，无 AI 生图成分。",
    toolCopyDesc: "给我一份脚本或转录稿，一次出齐全平台发布文案。",
    toolCopyPh: "粘贴口播稿或转录稿…",
    toolPublishDesc: "各平台上传页一键直达，文案一键复制。发布按钮永远由你来点。",
    toolInsightsDesc: "发布后回收播放/互动数据 → 复盘 → 校准 AI 的选题与打分标准。",
    insightsBody: `这是 Creator OS 的核心壁垒（已在命令行版跑通，UI 化排期中）：<br><br>
    01 · 发布前：AI 对每条内容做<b>盲预测</b>（7 维打分，写入不可篡改的预测日志）<br>
    02 · T+3 天：抓取真实数据，和预测对账<br>
    03 · 差距写回评分标准 → <b>AI 越用越懂你的账号</b><br><br>
    每个创作者的校准数据是自己独有的资产 —— 这就是"模板任何人可用，但每个人的 Creator OS 独一无二"的原因。`,
    platXhs: "小红书", platDy: "抖音", platSph: "视频号",
    packEmpty: "（先在文案包工具生成文案）",
    copyBtn: "复制文案", copied: "已复制 ✓",
    autofill: "自动填充上传", autofillNeed: "自动填充需要文案+成片路径（走流水线项目）",
    openUpload: "打开上传页 ↗",
    finalVideo: "成片文件", copyPath: "复制路径",
    publishNote: `半自动发布：Agent 备好一切（成片/文案/标签）——<b>发布按钮永远由你来点</b>。<br>
    说明：「自动填充上传」用的是独立的自动化浏览器（和你平时的 Chrome 不是同一个），首次使用需在<b>弹出的那个窗口里</b>扫码登录一次；「打开上传页」则是在你自己的浏览器里打开，两者登录状态互不相通。自动填充需要成片+文案，请从流水线项目的发布工位使用。`,
    prefillStarting: "正在拉起浏览器自动填充…",
    prefillStarted: "浏览器已拉起：视频与文案自动填充中，填完会停在发布页——请核对后亲手点发布。",
    needLogin: (pl) => `还没登录过该平台。<a href="#" onclick="loginPublish('${pl}');return false;" style="color:var(--lav);">点这里扫码登录一次</a>`,
    loginStarting: "正在拉起登录浏览器，请用手机 App 扫码…",
    loginStarted: "扫码窗口已打开。扫码成功后回来再点「自动填充上传」。",
    failed: "失败：",
    fTitle: "标题", fBody: "正文", fTags: "标签", fDyTitle: "抖音标题", fDyTags: "抖音标签",
    fSphTitle: "视频号标题", packX: "X · 引流推文", fZh: "中文", fEn: "English",
    packCover: "封面标题", fMain: "大标题", fSub: "小标题", altsLabel: "备选：",
    saveEdits: "保存修改", saved: "已保存 ✓",
    modalNew: "新建视频", modalTitle: "视频标题（工作用名）", modalTitlePh: "比如：Fable5 最后一天",
    modalType: "视频类型",
    modalKoubo: "纯口播", modalKouboDesc: "真人出镜讲述，走 ClipLab 剪辑（字幕/变速/画布）",
    modalKnow: "知识类 · 带 B-roll", modalKnowDesc: "讲解中自动配画面素材（截图/录屏/实景）",
    cancel: "取消", create: "创建",
    langBtn: "EN",
  },
};

let lang = localStorage.getItem("cos-lang") || "en";
let T = I18N[lang];

function toggleLang() {
  lang = lang === "en" ? "zh" : "en";
  localStorage.setItem("cos-lang", lang);
  T = I18N[lang];
  applySidebarLang();
  refreshProjects();
  render();
}

function applySidebarLang() {
  const set = (sel, v) => { const el = document.querySelector(sel); if (el) el.textContent = v; };
  set(".tagline", T.tagline);
  const secs = document.querySelectorAll(".navsec");
  if (secs[0]) secs[0].textContent = T.navPipelines;
  if (secs[1]) secs[1].textContent = T.navToolbox;
  const navLabel = (view, v) => { const el = document.querySelector(`.nav[data-view="${view}"] .navlabel`); if (el) el.textContent = v; };
  navLabel("tool-script", T.navScript);
  navLabel("tool-broll", T.navBroll);
  navLabel("tool-cover", T.navCover);
  navLabel("tool-copypack", T.navCopy);
  navLabel("tool-publish", T.navPublish);
  navLabel("tool-insights", T.navInsights);
  const nn = document.querySelector("#navNewLabel"); if (nn) nn.textContent = T.navNew;
  const lb = document.querySelector("#langBtn"); if (lb) lb.textContent = T.langBtn;
}

const state = {
  projects: [],
  currentProject: null,
  view: "tool-copypack",
};

// ---------- 基础 ----------
async function api(path, opts) {
  const r = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data.error || "request failed") + " [" + r.status + "]");
  return data;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function copyText(text, el) {
  navigator.clipboard.writeText(text).then(() => {
    const old = el.textContent;
    el.textContent = T.copied;
    setTimeout(() => (el.textContent = old), 1200);
  });
}

function setStatus(html) {
  const el = $("#mstatus");
  if (el) el.innerHTML = html;
}

// 写入可能已随视图切换消失的元素：找不到就静默跳过，不抛错
function setHTML(sel, html) {
  const el = $(sel);
  if (el) el.innerHTML = html;
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

function projectStage(p) {
  if (p.publish) return { idx: 6, label: T.stageReady };
  if (p.cover) return { idx: 5, label: T.stations[5] };
  if (p.broll || (p.footage && p.type === "koubo")) return { idx: 4, label: T.stations[4] };
  if (p.footage) return { idx: 3, label: T.stations[3] };
  if (p.script) return { idx: 2, label: T.stations[2] };
  if (p.idea) return { idx: 1, label: T.stations[1] };
  return { idx: 0, label: T.stations[0] };
}

// ---------- 视图 ----------
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
      <h3>${T.modalNew}</h3>
      <div class="fld"><label>${T.modalTitle}</label><input id="npTitle" type="text" placeholder="${T.modalTitlePh}"></div>
      <div class="fld"><label>${T.modalType}</label>
        <div class="typegrid">
          <div class="typecard sel" data-type="koubo"><b>${T.modalKoubo}</b><span>${T.modalKouboDesc}</span></div>
          <div class="typecard" data-type="knowledge"><b>${T.modalKnow}</b><span>${T.modalKnowDesc}</span></div>
        </div>
      </div>
      <div class="row" style="justify-content:flex-end;">
        <button class="btn sm ghost" id="npCancel">${T.cancel}</button>
        <button class="btn sm" id="npCreate">${T.create}</button>
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
function renderProject() {
  const p = state.currentProject;
  const stage = projectStage(p).idx;
  const cur = state.station ?? stage;
  const typeLabel = p.type === "knowledge" ? T.typeKnowledge : T.typeKoubo;

  main.innerHTML = `
    <div class="crumb">${T.crumbPipeline} / ${esc(p.title)}</div>
    <h1>${esc(p.title)} <span class="chip">${typeLabel}</span></h1>
    <div class="desc">${T.projectDesc}</div>
    <div class="card">
      <div class="line">
        ${T.stations.map((s, i) => {
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
  nav.innerHTML = `${cur > 0 ? `<button class="btn sm ghost" onclick="ui.openProject('${esc(p.id)}', ${cur - 1})">${T.back}</button>` : ""}
    ${cur < 6 ? `<button class="btn sm ghost" onclick="ui.openProject('${esc(p.id)}', ${cur + 1})">${T.next}</button>` : ""}
    <span class="t-xs t-faint">${T.navHint}</span>`;
  panel.appendChild(nav);
}

// 工位① 想法
function renderIdeaStation(el, p) {
  el.innerHTML = `<div class="card">
    <h4 style="margin-bottom:10px;">${T.ideaHead}</h4>
    <textarea id="ideaInput" placeholder="${T.ideaPh}">${esc(p.idea || "")}</textarea>
    <div class="row">
      <button class="btn" onclick="runScriptModule('${esc(p.id)}')">${T.ideaBtn}</button>
      <span id="mstatus"></span>
    </div></div>`;
}

// 工位② 脚本
function renderScriptStation(el, p) {
  if (!p.script) return renderIdeaStation(el, p);
  const s = p.script;
  el.innerHTML = `<div class="card">
    <h4 style="margin-bottom:12px;">${T.scriptHead}</h4>
    <div class="compare">
      <div><h4>${T.rawIdea}</h4><div class="out">${esc(p.idea || "—")}</div></div>
      <div><h4>${T.polished} · 《${esc(s.title)}》 · ${T.estSec.replace("{n}", esc(s.duration_est))}</h4>
        <div class="scriptbox" contenteditable="true" id="scriptEdit">${esc(s.script)}</div>
        <div class="t-xs t-warn" style="margin-top:8px;">${T.shootNote}${esc(s.notes || "")}</div></div>
    </div>
    <div class="row">
      <button class="btn ghost" onclick="runScriptModule('${esc(p.id)}')">${T.regen}</button>
      <button class="btn" onclick="confirmScript('${esc(p.id)}')">${T.approveScript}</button>
      <span id="mstatus"></span>
    </div></div>`;
}

// 工位③ 拍摄/登记
function renderFootageStation(el, p) {
  const f = p.footage || {};
  el.innerHTML = `<div class="card">
    <h4 style="margin-bottom:10px;">${T.footageHead}</h4>
    <div class="t-sm t-muted" style="margin-bottom:10px;">${T.footageFile}</div>
    <div class="row" style="margin:0 0 8px;">
      <input type="text" id="footagePath" placeholder="${T.footagePh}" value="${esc(f.path || "")}" style="flex:1;">
      <button class="btn sm ghost" onclick="pickFile('footagePath', T.pickVideoPrompt)">${T.chooseFile}</button>
    </div>
    <div class="t-sm t-muted" style="margin:14px 0 8px;">${T.transcriptLabel}</div>
    <div class="row" style="margin:0 0 8px;">
      <button class="btn sm ghost" onclick="importSrt()">${T.importSrt}</button>
      <span class="t-xs t-faint">${T.srtNote}</span>
    </div>
    <textarea id="transcriptInput" style="min-height:120px;" placeholder="${T.transcriptPh}">${esc(f.transcript || "")}</textarea>
    <div class="row"><button class="btn" onclick="saveFootage('${esc(p.id)}')">${T.footageDone}</button><span id="mstatus"></span></div>
  </div>`;
}

async function pickFile(inputId, prompt) {
  const r = await api("/api/pickfile", { method: "POST", body: JSON.stringify({ prompt }) });
  if (r.path) $("#" + inputId).value = r.path;
}

async function importSrt() {
  const r = await api("/api/pickfile", { method: "POST", body: JSON.stringify({ prompt: T.pickSrtPrompt }) });
  if (!r.path) return;
  try {
    const t = await api("/api/srt2transcript", { method: "POST", body: JSON.stringify({ path: r.path }) });
    $("#transcriptInput").value = t.transcript;
  } catch (e) { setStatus(`<span class="err">${esc(e.message)}</span>`); }
}

// 工位④ 剪辑
function renderEditStation(el, p) {
  if (p.type !== "knowledge") {
    el.innerHTML = `<div class="card"><h4 style="margin-bottom:10px;">${T.editKoubo} <span class="agentpill">${T.cliplabEngine}</span></h4>
      <div class="t-sm t-muted" style="margin:4px 0 4px;">${T.cliplabDesc}</div>
      <div class="row">
        <button class="btn" ${(p.footage || {}).path ? "" : "disabled"} onclick="runCliplabPrep('${esc(p.id)}')">${T.cliplabStart}</button>
        <button class="btn sm ghost" onclick="refreshCliplabLog()">${T.cliplabRefresh}</button>
        <span id="mstatus"></span>
      </div>
      <pre id="cliplabLog" class="t-xs t-faint" style="margin-top:12px;white-space:pre-wrap;max-height:200px;overflow:auto;"></pre>
      <div class="row"><button class="btn ghost" onclick="markEditDone('${esc(p.id)}')">${T.editDone}</button></div></div>`;
    return;
  }
  const transcript = (p.footage || {}).transcript;
  const b = p.broll;
  const hasCands = b && (b.points || []).some((pt) => (pt.candidates || []).length);
  const rendered = p.rendered || (b && b.rendered_path);
  el.innerHTML = `<div class="card">
    <h4 style="margin-bottom:10px;">${T.editKnowledge} <span class="agentpill">${T.editAgent}</span></h4>
    ${transcript ? "" : `<div class="err">${T.noTranscript}</div>`}
    <div class="row" style="margin-top:4px;">
      <button class="btn ${b ? "ghost" : ""}" ${transcript ? "" : "disabled"} onclick="runBrollModule('${esc(p.id)}')">${b ? T.reannotate : T.annotate}</button>
      ${b ? `<button class="btn ${hasCands ? "ghost" : ""}" onclick="runBrollSearch('${esc(p.id)}')">${hasCands ? T.researchStock : T.searchStock}</button>` : ""}
      ${hasCands ? `<button class="btn" onclick="runBrollRender('${esc(p.id)}')">${T.downloadComposite}</button>` : ""}
      <span id="mstatus"></span>
    </div>
    <div id="brollList" style="margin-top:16px;">${b ? brollListHtml(b) : ""}</div>
    <div id="renderOut">${rendered ? renderedHtml(p.id) : ""}</div>
    ${b ? `<div class="row"><button class="btn ghost" onclick="ui.openProject('${esc(p.id)}', 4)">${T.toCover}</button></div>` : ""}
  </div>`;
}

function renderedHtml(projectId) {
  return `<div style="margin-top:18px;">
    <h4 style="margin-bottom:10px;">${T.compositeResult}</h4>
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
          <option value="pip" ${defMode === "pip" ? "selected" : ""}>${T.pip}</option>
          <option value="full" ${defMode === "full" ? "selected" : ""}>${T.full}</option>
        </select>` : ""}
      </div>
      ${cands.length ? `<div class="cands">${cands.map((c, j) => `<img class="cand ${j === 0 ? "sel" : ""}" src="${esc(c.thumb_url)}" data-j="${j}" title="${esc(c.source)} · ${c.width}x${c.height}" onclick="selectCand(this)">`).join("")}</div>` : ""}
    </div>`;
    })
    .join("");
}

// 剪辑完成 → 自动登记 ClipLab 成品为"发布用成片"
async function markEditDone(projectId) {
  const f = (state.currentProject.footage || {});
  try {
    const r = await api("/api/cliplab/final", { method: "POST", body: JSON.stringify({ videoPath: f.path }) });
    if (r.found) {
      f.final_path = r.path;
      await api(`/api/projects/${encodeURIComponent(projectId)}/artifact/footage`, { method: "POST", body: JSON.stringify({ content: f }) });
    }
  } catch {}
  ui.openProject(projectId, 4);
}

async function runCliplabPrep(projectId) {
  const p = state.currentProject;
  setStatus(`<span class="spinner">${T.cliplabStarting}</span>`);
  try {
    await api("/api/cliplab/prep", { method: "POST", body: JSON.stringify({ videoPath: (p.footage || {}).path }) });
    setStatus(T.cliplabStarted);
    refreshCliplabLog();
  } catch (e) { setStatus(`<span class="err">${esc(e.message)}</span>`); }
}

async function refreshCliplabLog() {
  const r = await api("/api/cliplab/log");
  const el = document.getElementById("cliplabLog");
  if (el) el.textContent = r.tail;
  const m = (r.tail || "").match(/Review URL: (http\S+)/);
  if (m) setStatus(T.cliplabDone(m[1]));
}

function selectCand(img) {
  img.parentElement.querySelectorAll(".cand").forEach((c) => c.classList.remove("sel"));
  img.classList.add("sel");
}

async function runBrollSearch(projectId) {
  const b = state.currentProject.broll;
  if (!b) return;
  setStatus(`<span class="spinner">${T.brollSearching}</span>`);
  try {
    const r = await api("/api/broll/search", { method: "POST", body: JSON.stringify({ points: b.points, projectId }) });
    state.currentProject.broll = r;
    renderProject();
  } catch (e) { setStatus(`<span class="err">${esc(e.message)}</span>`); }
}

async function runBrollRender(projectId) {
  const p = state.currentProject;
  const videoPath = (p.footage || {}).path;
  if (!videoPath) return setStatus(`<span class="err">${T.brollNoVideo}</span>`);
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
  if (!items.length) return setStatus(`<span class="err">${T.brollNoneSelected}</span>`);
  setStatus(`<span class="spinner">${T.brollRendering}</span>`);
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
    <h4 style="margin-bottom:10px;">${T.coverHead}</h4>
    ${cover ? `<div class="out" style="margin-bottom:12px;">${T.coverSuggest}<b>${esc(cover.main_title)}</b>　${T.coverSub}${esc(cover.sub_title)}<br>${T.coverAlts}${(cover.alt_titles || []).map(esc).join(" / ")}</div>` : `<div class="t-sm t-faint" style="margin-bottom:12px;">${T.coverRunCopyFirst}</div>`}
    <iframe class="coverlab" src="https://cover-factory-web.vercel.app"></iframe>
    <div class="row"><button class="btn" onclick="ui.openProject('${esc(p.id)}', 5)">${T.coverDone}</button></div>
  </div>`;
}

// 工位⑥ 文案
function renderCopyStation(el, p) {
  const script = (p.script || {}).script || (p.footage || {}).transcript;
  el.innerHTML = `<div class="card">
    <h4 style="margin-bottom:10px;">${T.copyHead} <span class="agentpill">${T.copyAgent}</span></h4>
    ${script ? "" : `<div class="err">${T.copyNoScript}</div>`}
    <div class="row" style="margin-top:4px;">
      <button class="btn" ${script ? "" : "disabled"} onclick="runCopypackModule('${esc(p.id)}')">${T.copyGen}</button>
      <span id="mstatus"></span>
    </div>
    <div id="packOut" style="margin-top:6px;">${p.publish ? packHtml(p.publish, p.id) : ""}</div>
    ${p.publish ? `<div class="row"><button class="btn" onclick="ui.openProject('${esc(p.id)}', 6)">${T.copyOk}</button></div>` : ""}
  </div>`;
}

// 工位⑦ 发布台
function renderPublishStation(el, p) {
  el.innerHTML = publishDeckHtml(p.publish, p.bestVideo || (p.footage || {}).path);
}

// ---------- 独立工具视图 ----------
function toolShell(crumb, title, chip, desc, inner) {
  main.innerHTML = `<div class="crumb">${T.crumbToolbox} / ${crumb}</div>
    <h1>${title} <span class="chip">${T.standalone}</span>${chip || ""}</h1>
    <div class="desc">${desc}</div>${inner}`;
}

function renderScriptTool() {
  toolShell(T.navScript, `<span class="tile lav"><svg class="ic"><use href="#i-edit"/></svg></span>${T.navScript}`, "", T.toolScriptDesc, `
    <div class="card">
      <textarea id="ideaInput" placeholder="${T.ideaPh}"></textarea>
      <div class="row"><button class="btn" onclick="runScriptModule(null)">${T.toolScriptBtn}</button><span id="mstatus"></span></div>
      <div id="scriptOut" style="margin-top:16px;"></div>
    </div>`);
}

let editLane = "koubo";
function renderEditToolLane(lane) { editLane = lane; renderBrollTool(); }

function renderBrollTool() {
  const koubo = editLane === "koubo";
  toolShell(T.navBroll, `<span class="tile peach"><svg class="ic"><use href="#i-film"/></svg></span>${T.navBroll}`, "", koubo ? T.cliplabDesc : T.toolBrollDesc, `
    <div class="card">
      <div class="srcpick" style="margin-bottom:16px;">
        <div class="${koubo ? "on" : ""}" onclick="renderEditToolLane('koubo')">${T.laneKoubo}</div>
        <div class="${koubo ? "" : "on"}" onclick="renderEditToolLane('broll')">${T.laneBroll}</div>
      </div>
      ${koubo ? `
      <div class="row" style="margin:0 0 8px;">
        <input type="text" id="edVideoPath" placeholder="${T.footagePh}" style="flex:1;">
        <button class="btn sm ghost" onclick="pickFile('edVideoPath', T.pickVideoPrompt)">${T.chooseFile}</button>
      </div>
      <div class="row">
        <button class="btn" onclick="runCliplabPrepPath()">${T.cliplabStart}</button>
        <button class="btn sm ghost" onclick="refreshCliplabLog()">${T.cliplabRefresh}</button>
        <span id="mstatus"></span>
      </div>
      <pre id="cliplabLog" class="t-xs t-faint" style="margin-top:12px;white-space:pre-wrap;max-height:240px;overflow:auto;"></pre>
      ` : `
      <textarea id="transcriptInput" style="min-height:150px;" placeholder="${T.transcriptPh}"></textarea>
      <div class="row"><button class="btn" onclick="runBrollModule(null)">${T.annotate}</button><span id="mstatus"></span></div>
      <div id="brollList" style="margin-top:16px;"></div>
      `}
    </div>`);
}

// 工具箱版口播剪辑：直接对文件路径启动 ClipLab，不依赖流水线项目
async function runCliplabPrepPath() {
  const vp = $("#edVideoPath").value.trim();
  if (!vp) return setStatus(`<span class="err">${T.footagePh}</span>`);
  setStatus(`<span class="spinner">${T.cliplabStarting}</span>`);
  try {
    await api("/api/cliplab/prep", { method: "POST", body: JSON.stringify({ videoPath: vp }) });
    setStatus(T.cliplabStarted);
    refreshCliplabLog();
  } catch (e) { setStatus(`<span class="err">${esc(e.message)}</span>`); }
}

function renderCoverTool() {
  toolShell(T.navCover, `<span class="tile sky"><svg class="ic"><use href="#i-image"/></svg></span>${T.navCover}`, "", T.toolCoverDesc, `
    <iframe class="coverlab" src="https://cover-factory-web.vercel.app"></iframe>`);
}

function renderCopypackTool() {
  toolShell(T.navCopy, `<span class="tile mint"><svg class="ic"><use href="#i-layers"/></svg></span>${T.navCopy}`, "", T.toolCopyDesc, `
    <div class="card">
      <textarea id="scriptInput" placeholder="${T.toolCopyPh}"></textarea>
      <div class="row"><button class="btn" onclick="runCopypackModule(null)">${T.copyGen}</button><span id="mstatus"></span></div>
      <div id="packOut" style="margin-top:6px;"></div>
    </div>`);
}

function renderPublishTool() {
  toolShell(T.navPublish, `<span class="tile rose"><svg class="ic"><use href="#i-send"/></svg></span>${T.navPublish}`, "", T.toolPublishDesc, publishDeckHtml(lastPack, null));
}

function renderInsights() {
  toolShell(T.navInsights, `<span class="tile lav"><svg class="ic"><use href="#i-chart"/></svg></span>${T.navInsights}`, `<span class="chip dim">roadmap</span>`, T.toolInsightsDesc, `
    <div class="card"><div class="out">${T.insightsBody}</div></div>`);
}

// ---------- 发布台 ----------
let lastPack = null;

const PLATFORMS = [
  { key: "xiaohongshu", nameKey: "platXhs", dot: "#ff2442", auto: false, url: "https://creator.xiaohongshu.com/publish/publish", get: (pk) => pk ? `${pk.xiaohongshu.title}\n\n${pk.xiaohongshu.body}\n\n${(pk.xiaohongshu.tags || []).map((t) => "#" + t).join(" ")}` : "" },
  { key: "douyin", nameKey: "platDy", dot: "#1d1d1f", auto: true, url: "https://creator.douyin.com/creator-micro/content/upload", get: (pk) => pk ? `${pk.douyin.title}\n${(pk.douyin.tags || []).map((t) => "#" + t).join(" ")}` : "" },
  { key: "shipinhao", nameKey: "platSph", dot: "#fa9d3b", auto: true, url: "https://channels.weixin.qq.com/platform/post/create", get: (pk) => pk ? `${(pk.shipinhao && pk.shipinhao.title) || pk.douyin.title}` : "" },
];

function publishDeckHtml(pack, videoPath) {
  window._deckCtx = { pack, videoPath };
  return `<div class="pubgrid">
    ${PLATFORMS.map((pl) => {
      const text = pack ? pl.get(pack) : "";
      const canAuto = pl.auto && pack && videoPath;
      return `<div class="pubcard">
        <h3><span class="pdot" style="background:${pl.dot}"></span>${T[pl.nameKey]}</h3>
        <div class="content">${text ? esc(text) : `<span style="color:var(--ink-faint);">${T.packEmpty}</span>`}</div>
        <div class="row">
          <button class="btn sm ghost" ${text ? "" : "disabled"} onclick="copyText(${JSON.stringify(text).replace(/"/g, "&quot;")}, this)">${T.copyBtn}</button>
          ${pl.auto ? `<button class="btn sm" ${canAuto ? "" : "disabled"} title="${canAuto ? "" : T.autofillNeed}" onclick="prefillPublish('${pl.key}')">${T.autofill}</button>` : ""}
          <button class="btn sm ${pl.auto ? "ghost" : ""}" onclick="window.open('${pl.url}','_blank')">${T.openUpload}</button>
        </div>
        <div class="t-xs t-faint" id="pubstatus-${pl.key}" style="margin-top:8px;"></div></div>`;
    }).join("")}
  </div>
  ${videoPath ? `<div class="card" style="margin-top:16px;"><b style="font-size:13.5px;">${T.finalVideo}</b>
    <div class="row"><span class="t-sm t-muted">${esc(videoPath)}</span>
    <button class="btn sm ghost" onclick="copyText('${esc(videoPath)}', this)">${T.copyPath}</button></div></div>` : ""}
  <div class="steps-note">${T.publishNote}</div>`;
}

async function prefillPublish(platform) {
  const ctx = window._deckCtx || {};
  const pk = ctx.pack;
  if (!pk || !ctx.videoPath) return;
  const st = document.getElementById("pubstatus-" + platform);
  if (!st) return;
  st.textContent = T.prefillStarting;
  try {
    await api("/api/publish/prefill", { method: "POST", body: JSON.stringify({
      platform,
      videoPath: ctx.videoPath,
      title: pk.douyin.title,
      desc: pk.xiaohongshu.body,
      tags: pk.douyin.tags || [],
    }) });
    st.textContent = T.prefillStarted;
  } catch (e) {
    if (/needLogin|409/.test(e.message)) {
      st.innerHTML = T.needLogin(platform);
    } else {
      st.textContent = T.failed + e.message;
    }
  }
}

async function loginPublish(platform) {
  const st = document.getElementById("pubstatus-" + platform);
  if (!st) return;
  st.textContent = T.loginStarting;
  try {
    await api("/api/publish/login", { method: "POST", body: JSON.stringify({ platform }) });
    st.textContent = T.loginStarted;
  } catch (e) { st.textContent = T.failed + e.message; }
}

// ---------- 模块调用 ----------
async function runScriptModule(projectId) {
  const idea = $("#ideaInput").value.trim();
  if (!idea) return setStatus(`<span class="err">${T.ideaFirst}</span>`);
  setStatus(`<span class="spinner">${T.scriptThinking}</span>`);
  try {
    const r = await api("/api/module/script", { method: "POST", body: JSON.stringify({ idea, projectId }) });
    if (projectId) return ui.openProject(projectId, 1);
    setHTML("#scriptOut", `<div class="scriptbox"><b>《${esc(r.title)}》</b> · ${T.estSec.replace("{n}", esc(r.duration_est))}\n\n${esc(r.script)}\n\n${T.shootNote}${esc(r.notes || "")}</div>`);
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
  if (!transcript) return setStatus(`<span class="err">${T.brollNoTranscript}</span>`);
  setStatus(`<span class="spinner">${T.brollAnalyzing}</span>`);
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
    <div class="out"><h4><span class="pdot" style="background:#ff2442;margin-right:6px;"></span>${T.platXhs}</h4>
      ${fld(T.fTitle, "xiaohongshu.title", pk.xiaohongshu.title, 1)}
      ${fld(T.fBody, "xiaohongshu.body", pk.xiaohongshu.body, 6)}
      ${fld(T.fTags, "xiaohongshu.tags", (pk.xiaohongshu.tags || []).map((t) => "#" + t).join(" "), 1)}
    </div>
    <div class="out"><h4><span class="pdot" style="background:#1d1d1f;margin-right:6px;"></span>${T.platDy} · <span class="pdot" style="background:#fa9d3b;margin:0 6px;"></span>${T.platSph}</h4>
      ${fld(T.fDyTitle, "douyin.title", pk.douyin.title, 1)}
      ${fld(T.fDyTags, "douyin.tags", (pk.douyin.tags || []).map((t) => "#" + t).join(" "), 1)}
      ${fld(T.fSphTitle, "shipinhao.title", sp.title || pk.douyin.title, 1)}
    </div>
    <div class="out"><h4><span class="pdot" style="background:#3579d6;margin-right:6px;"></span>${T.packX}</h4>
      ${fld(T.fZh, "x.post_zh", x.post_zh || x.thread_zh || "", 3)}
      ${fld(T.fEn, "x.post_en", x.post_en || x.post || "", 3)}
    </div>
    <div class="out"><h4><span class="pdot" style="background:#9d7bf5;margin-right:6px;"></span>${T.packCover}</h4>
      ${fld(T.fMain, "cover.main_title", pk.cover.main_title, 1)}
      ${fld(T.fSub, "cover.sub_title", pk.cover.sub_title, 1)}
      <div class="t-xs t-faint" style="margin-top:6px;">${T.altsLabel}${(pk.cover.alt_titles || []).map(esc).join(" / ")}</div>
    </div>
  </div>
  <div class="row"><button class="btn sm" onclick="savePack()">${T.saveEdits}</button><span class="t-xs t-faint" id="packSaveStatus"></span></div>`;
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
  if (st) {
    st.textContent = T.saved;
    setTimeout(() => (st.textContent = ""), 1500);
  }
}

async function runCopypackModule(projectId) {
  const script = projectId
    ? ((state.currentProject.script || {}).script || (state.currentProject.footage || {}).transcript)
    : $("#scriptInput").value.trim();
  if (!script) return setStatus(`<span class="err">${T.copyNoContent}</span>`);
  setStatus(`<span class="spinner">${T.copyWriting}</span>`);
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
  applySidebarLang();
  await refreshProjects();
  ui.show("tool-copypack");
})();

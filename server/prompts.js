// Creator OS — LLM prompt 模板。所有步骤的提示词集中在这里，便于调优和后续翻译。

function optimizeScript(rawIdea) {
  return `你是一位短视频口播稿编辑，服务对象是知识类创作者（小红书/抖音，真人口播出镜）。
用户口述了一段想法（可能是语音转文字，有错别字，按语义理解）：

<想法>
${rawIdea}
</想法>

请把它整理成一份可直接照着拍的口播稿，要求：
1. 开头 1-2 句必须是钩子（悬念/反常识/利益点），3 秒内让人不划走
2. 口语化短句，每句不超过 20 字，方便提词和呼吸停顿
3. 保留用户的原始观点和例子，不要自己编造事实
4. 结尾一句自然的互动引导（不要"记得点赞关注"这种烂大街的）
5. 总长控制在口播 60-120 秒（约 250-500 字）

只输出以下 JSON（不要 markdown 代码块，不要其他文字）：
{"title": "这条视频的工作标题", "hook": "开头钩子句", "script": "完整口播稿，用\\n分句", "duration_est": "预计口播秒数(数字)", "notes": "给拍摄者的一句提醒（哪里要加重语气/停顿）"}`;
}

function brollPoints(transcript) {
  return `你是知识类短视频的 B-roll 策划。下面是一段真人口播视频的逐句转录稿（含时间戳，格式：[开始秒-结束秒] 文字）：

<转录稿>
${transcript}
</转录稿>

任务：找出最值得插入辅助画面（B-roll）的 3-6 个时间点。判断标准：
- 提到具体产品/网站/工具 → 适合放截图或界面录屏
- 提到数据/对比/排名 → 适合放图表卡片
- 提到抽象概念/比喻 → 适合放示意图或实景素材
- 纯个人观点、情绪表达的句子不要配（保留真人脸出镜）
- 两个插入点之间至少间隔 5 秒，单个素材展示 2-4 秒

每个点给出用于素材搜索的英文关键词（搜 Pexels 等英文素材库用）和中文说明。

只输出以下 JSON（不要 markdown 代码块）：
{"points": [{"start": 开始秒(数字), "end": 结束秒(数字), "line": "对应的转录原句", "type": "screenshot|chart|footage|diagram", "search_en": "english search keywords", "desc": "配什么画面，一句中文说明"}]}`;
}

function copyPack(script, videoTitle) {
  return `你是自媒体发布文案专家。基于这份口播稿，生成三平台发布文案包。
视频工作标题：${videoTitle || "（无）"}

<口播稿>
${script}
</口播稿>

风格要求：口语、短句、少长定语、不要 AI 感（禁用"赋能/破局/干货满满/家人们"）。

只输出以下 JSON（不要 markdown 代码块）：
{
  "cover": {"main_title": "封面大标题(≤10字，冲击力)", "sub_title": "封面小标题(≤14字)", "alt_titles": ["备选大标题1", "备选大标题2"]},
  "xiaohongshu": {"title": "小红书标题(≤20字，带1个emoji)", "body": "正文，150-300字，分段，结尾带互动问题", "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]},
  "douyin": {"title": "抖音标题(≤30字)", "tags": ["tag1", "tag2", "tag3"]},
  "x": {"post": "英文推文，≤280字符，附1-2个hashtag", "thread_zh": "中文金句版推文"}
}`;
}

module.exports = { optimizeScript, brollPoints, copyPack };

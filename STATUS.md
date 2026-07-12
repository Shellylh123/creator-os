# Creator OS — STATUS

> 一人 MCN 操作系统 · Your One-Person Media Company
> BUIDL_OPC_Hackathon_SG（2026-07-12，新加坡）参赛项目，18:00 提交

## 当前状态（2026-07-12 下午）
- 产品：模块化内容创作 Agent 流水线，7 模块（想法→脚本→拍摄→剪辑[口播/知识类B-roll]→封面→文案→发布台）+ 数据复盘 roadmap
- 形态：本地 Web 应用（Node/express + 原生前端），`npm start` → http://localhost:3210
- 已跑通（真 LLM，走本机 claude CLI）：脚本优化、B-roll 策划、文案包；封面=内嵌已上线的 CoverLab；发布台保底版（复制文案+打开三平台上传页）
- 设计系统：浅色高级简洁（Lovable/Apple Card 参考），线性图标，紫→暖金渐变点缀

## 在跑的事（多 agent 并行）
| 角色 | 任务 | 状态 |
|---|---|---|
| broll-builder | 素材检索(Pexels)+ffmpeg 合成模块 server/broll.js | 进行中 |
| publish-builder | 半自动发布（抖音/视频号自动填充，停在发布按钮前）server/publish.js | 进行中 |
| pitch-writer | pitch/deck-zh.md + demo-script-zh.md + one-liner.md | 进行中 |
| 总控(main) | UI/集成/验收/英文化/GitHub | 本文件 |

## 待办（今天）
- [ ] pitch 中文稿用户确认后翻英文（UI 文案也要英文版）
- [ ] demo 视频/现场演示准备
- [ ] 提交：GitHub 链接 + demo

## 赛后 backlog（用户 2026-07-12 验收提出）
- [ ] 脚本优化质量：派专门 agent 调研"什么样的内容写法带流量"，沉淀为脚本 Agent 的知识库（用户点名重点）
- [ ] ClipLab 深度集成：审核页/试听页嵌入 Creator OS（今天只做了一键启动预处理+日志）
- [ ] 文案 Agent 持续调优；X 引流推文效果观察
- [ ] 小红书自动填充：优先方案=给小红书单做"AI 现场驱动"旁路（参考博主 oil欧呦 的 Codex 主+子Agent 架构，评估每次发布的 token 成本），不动现有脚本
- [ ] 给 social-auto-upload 补 5 条防风控填表技巧（React 原生 setter 填值/填后读回校验/抖音话题实体流程/B站上传校验/视频号登录态易掉）——拆解报告见 git 历史与本条
- [ ] 发布 Agent"自愈"机制（撞到平台改版把解法写回平台说明书）——与校准闭环同哲学，roadmap 素材
- [ ] 多账号管理参考评论区"九华"方案（每浏览器固定登一个账号+文案预存）
- [ ] 数据复盘模块 UI 化（cheat-on-content 校准闭环搬进来）

## 决策记录
- 2026-07-12 | UI 形态=方案D（工具箱+流水线双模式，模块可单独用） | 用户要求每个模块可单独使用、单独调优
- 2026-07-12 | B-roll 采用 OpenMontage 拆件（素材工具+策划知识），不跑其完整管道 | 评估结论：Remotion 合成链太重，赶不上 ddl
- 2026-07-12 | 半自动发布：抖音/视频号走 social-auto-upload 自动填充（注掉发布点击），小红书用打开上传页兜底 | 小红书选择器最脆；发布按钮永远人点=产品红线
- 2026-07-12 | 视觉：浅色 Lovable/Apple Card 风，弃暗色 Linear 方案 | 用户看图定调
- 2026-07-12 | 纯口播剪辑引用现有 ClipLab 管线，不重写 | 结构完整优先，引擎外置

## 技术备忘
- LLM 调用：server/llm.js 走本机 `claude -p`；提示词全部在 server/prompts.js（外置可调优）
- 素材 key：.env（PEXELS_API_KEY，已配置，不入库）
- 第三方评估产物：~/Projects/openmontage-eval/（OpenMontage clone+venv）、~/Projects/publish-eval/（social-auto-upload 已装依赖）
- 开源引用：OpenMontage（AGPL，vendor/openmontage/ 留了 SOURCE.md）、social-auto-upload

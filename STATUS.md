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

## 待办
- [ ] 挂载 broll.js / publish.js 路由到 server/index.js（等 agent 交付）
- [ ] pitch 中文稿用户确认后翻英文（UI 文案也要英文版）
- [ ] demo 视频/现场演示准备
- [ ] 提交：GitHub 链接 + demo

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

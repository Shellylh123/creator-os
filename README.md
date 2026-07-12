# Creator OS — Your One-Person Media Company

> Built at **BUIDL_OPC_Hackathon_SG** (Singapore, July 12, 2026) · Theme: *Building the Next Generation of One Person Companies through Agentic Services*

**One idea in. A published-ready video package out.** Creator OS is a modular agent pipeline that turns a solo creator into a full media company: script writing, video editing, B-roll sourcing, cover design, multi-platform copywriting, and semi-automatic publishing — with a human approving every station.

**Humans judge. Agents execute.**

## Why

Content creators spend most of their time *not creating*: cutting silence out of footage, designing covers, rewriting the same copy for three platforms, clicking through upload forms. We automated all of it — except judgment. Every station produces work for the creator to approve, edit, or reject. The publish button is *always* pressed by a human.

## The pipeline

```
Idea ─→ Script ─→ Shoot ─→ Edit ─→ Cover ─→ Copy ─→ Publish
 01      02        03       04       05       06       07
 you    Script    you     Edit    Cover    Copy    Publish
        Agent            Agent    Agent    Agent    Desk
```

Every module works **standalone** (paste a transcript, get copy — no pipeline needed) or **chained** (each station's artifact flows to the next). Each agent's prompt lives in a plain editable file — creators tune their agents without touching code.

- **01 Idea** — dictate or paste a raw idea (voice-to-text friendly)
- **02 Script Agent** — turns rambling into a hook-first, shoot-ready script
- **03 Shoot** — register your footage; import SRT subtitles with one click
- **04 Edit Agent** — two lanes:
  - *Talking-head*: one-click ClipLab preprocessing (normalize + ASR + AI sentence-split) → human review page → single-encode final cut
  - *Knowledge · B-roll*: AI reads the timestamped transcript, marks where visuals belong, searches free stock libraries (Pexels/Pixabay), you pick candidates, ffmpeg composites (PiP or full-screen)
- **05 Cover Agent** — embeds our production CoverLab (real-photo cutouts + fixed templates, zero AI-generated imagery) with AI-suggested cover titles
- **06 Copy Agent** — one click: Xiaohongshu title/body/tags, Douyin title, WeChat Channels title, X traffic post (EN+ZH), cover titles — all editable in place
- **07 Publish Desk** — automation browser uploads the video and fills title/copy/tags on Douyin & WeChat Channels, then **stops on the publish page**. The human reviews and presses publish.
- **08 Insights (roadmap)** — the moat: blind AI predictions before publishing, reconciled against real T+3 data, feeding back into the scoring rubric. The AI learns *your* audience. Already running in CLI form.

## Real usage, real numbers

The system's precursor pipeline already runs a real account:

- Video preprocessing: **56 seconds**, unattended
- Human hands-on time per video: **~10 minutes** (was hours)
- CoverLab: **17 production templates**, live at [cover-factory-web.vercel.app](https://cover-factory-web.vercel.app)
- The demo video in this repo's workspace is a real published video, with real stock B-roll composited by the Edit Agent

## Run it

```bash
npm install
npm start        # → http://localhost:3210
```

Requirements: macOS, Node 18+, ffmpeg, [Claude Code CLI](https://claude.com/claude-code) (agents run on Claude), optional `PEXELS_API_KEY` in `.env` for stock search, python3.10+ + [social-auto-upload](https://github.com/dreammis/social-auto-upload) for publish auto-fill.

UI is bilingual (EN / 中文) — toggle at the bottom of the sidebar.

## Architecture notes

- **Modules over monolith**: each station reads upstream artifacts and writes its own (`workspace/<project>/01_idea.md → 06_publish.json`). Swap any module's engine without touching the rest.
- **Prompts are user-space**: agent brains live in `server/prompts.js`, designed to be tuned per-creator. The template is public; a tuned Creator OS is uniquely yours.
- **Human gates everywhere**: script approval, B-roll candidate selection, editable copy, and a publish button that is never clicked by a machine.

## Standing on open source

- [OpenMontage](https://github.com/calesthio/OpenMontage) (AGPL) — B-roll planning knowledge + stock sourcing tools (`vendor/openmontage/`)
- [social-auto-upload](https://github.com/dreammis/social-auto-upload) — platform upload automation (patched to *never* click publish)
- [chengfeng-videocut-skills](https://github.com/chengfeng-videocut) — talking-head editing engine (ClipLab)

## Team

One person + a fleet of agents. This project *is* its own proof: it was designed, built, debugged, and pitched in one day by a solo non-technical founder directing Claude agents.

---

*Built with [Claude Code](https://claude.com/claude-code) · Fable 5's last day, put to work.*

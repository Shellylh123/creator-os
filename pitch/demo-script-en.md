# Creator OS · 90-Second Live Demo Script (English)

> Goal: in 90 seconds, show "ships in 10 seconds → full pipeline (talking-head editing as the hero) → human-in-the-loop → human presses publish"
> Principle: less talking, more clicking. Act first, explain second. All Claude-powered.
> Order: Copy Pack standalone (ships in 10 sec) → pipeline + talking-head editing (HERO segment: production-proven ClipLab lane, 56s preprocessing / ~10 min hands-on) → brief B-roll showcase (early feature, keep it light) → Publish Desk (auto-fill + human presses publish)
> Note: B-roll is deliberately de-emphasized — mention two lanes (talking-head / knowledge with B-roll), demo the annotation + composite result briefly, don't dwell.
> UI button names below match the live interface. The UI is bilingual — a toggle in the bottom-left switches EN / 中文.

---

## Pre-demo setup (30 sec before, while Slide 4 is up)

- [ ] Three browser tabs open: (1) Copy Pack (2) pipeline view (New video) (3) Publish Desk
- [ ] Confirm network connectivity; run the LLM endpoint once to warm it up and avoid cold-start lag
- [ ] Have a ready-made transcript text on hand, paste-ready
- [ ] Plan B assets in place (see end)

---

## Segment 1 · Copy Pack ships (0–20 sec)

**Actions:**
1. Switch to the **Copy Pack** tab
2. Paste a ready-made video transcript into the input box
3. Click **Generate multi-platform copy**

**What to say (talking while clicking):**
> Quick thing first — the whole UI is bilingual, English or Chinese, one toggle. Bilingual out of the box.
> Now, the smallest piece — it works standalone. Here's a transcript from a video. I paste it in, hit Generate multi-platform copy —

(Wait for output, roughly 5–10 sec to ship)

> There. Done. Rednote title, body and tags, TikTok title, an X one-liner, and thumbnail title candidates — all at once. I used to hand-write these platform by platform. Now, ten seconds.

**The key:** let the judges see with their own eyes — one input, captions for three platforms at once. This is the fastest-hitting hook.

---

## Segment 2 · Pipeline + talking-head editing — HERO segment (20–55 sec)

**Actions:**
1. Open a talking-head pipeline project; sweep the mouse across the 7 stations: **Idea → Script → Shoot → Edit → Cover → Copy → Publish**
2. Open the **New video** modal briefly — show the two lane cards (**Talking-head** / **Knowledge · B-roll**) — close it
3. Enter station 04 Edit: show **Start ClipLab preprocessing** and the progress log
4. Open the review page (localhost:8900) in a new tab: tick off one bad line, double-click to fix a word
5. Back in station 04, scroll to the **Final cut preview** player and play the captioned final cut for 2–3 seconds
   (Before recording: press "Edit done → Cover" once in station 04 so the final cut gets registered and the player appears)

**What to say:**
> That Copy Pack is one station on this line: Idea, Script, Shoot, Edit, Cover, Copy, Publish. Two kinds of videos — pure talking-head, or knowledge videos with B-roll.
> Talking-head is the production lane — I run my real account on it. One click: normalize, transcribe, AI sentence-split — fifty-six seconds, unattended. Then I review the transcript like a document: delete a bad take, fix a word, and the final cut renders in one pass, captions burned in. Hands-on time per video: about ten minutes. It used to be hours.

**The key:** this is the production-proven core. Real account, real numbers (56 sec / 10 min). Let it breathe.

---

## Segment 3 · B-roll quick showcase (55–68 sec)

**Actions:**
1. Switch to the knowledge-type project's Edit station
2. Show the annotated B-roll points with stock thumbnails; click one candidate to select it
3. Scroll to **Composite result**, play the composited video 2–3 seconds

**What to say:**
> For knowledge videos there's an early B-roll lane too: the Agent reads the transcript, marks where visuals belong, pulls stock candidates. I pick — it composites. The Agent does the grunt work; I make the calls.

**The key:** keep it light and honest — it's an early feature. The human-picks-the-Agent-executes beat still lands the theme.

---

## Segment 4 · Publish Desk · auto-fill + human presses publish (65–90 sec)

**Actions:**
1. Switch to the **Publish Desk** tab
2. Click **Auto-fill upload** for one platform; show the upload page filled in: video, thumbnail, title, body, tags all in place
3. Move the mouse over the **Publish** button, hover, don't click

**What to say:**
> Last step, the Publish Desk. Hit **Auto-fill upload** and it fills the page — video, thumbnail, title, body, tags, all in place. No more manual typing.
> (Hover the mouse over the Publish button)
> But this Publish button is always pressed by a human. The AI can get everything ready. The one press that sends it — that has to be a person's decision.
> (Press Publish, or hold here as the closing, depending on time)
> That's Creator OS. One person, a crew of Agents, a whole media company.

**The key:** end on the "mouse hovering over Publish" beat — it nails the theme line.

---

## Plan B · Recovery playbook (when network / LLM is slow)

| Risk | Symptom | Recovery |
|---|---|---|
| LLM generation hangs | Copy Pack clicked, no output | Immediately switch to a pre-run result screenshot/text: "Network's shaky live — here's the same run from earlier, identical content," and keep going |
| Full network drop | No pages load | Switch to a locally recorded 30-sec demo screencast, narrate over it |
| B-roll retrieval slow | Candidate list spinning | Skip live Search stock candidates, show the already-composed finished clip: "Here's the result once it's assembled" |
| Over time | Still not at the Publish Desk by 60 sec | Cut the swap-footage step in Segment 3, jump to the Publish Desk — the "human presses Publish" beat is non-negotiable |

**Iron rule:** however you recover, Segment 4's "the Publish button is always human-pressed" must be demoed. It's the memory hook tied to the hackathon theme — never drop it.

**Do before demo:** run every segment once ahead of time and screenshot/screencast it, saved locally. Even with a full network drop, you can walk the whole flow from screenshots.

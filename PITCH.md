# Diagnose — README & Pitch Doc

**Hackathon:** AIC × Anthropic Claude Hackathon
**Track:** 3 — Economic Empowerment & Education
**Build:** Solo · 24 hours · React single-file artifact + Claude Sonnet 4

---

## What it is, in one sentence

A career diagnosis tool for 3rd-year Tier-2 Indian engineering students that compares their resume against a target role and returns a ranked, confidence-labeled list of likely rejection reasons with specific additive fixes calibrated to their time horizon.

---

## Who it's for

**Persona — "Aditya"**
- 3rd year, B.Tech CSE, HBTU Kanpur (or any state engineering / mid private / good govt college, NOT IIT/NIT/BITS/IIIT-H)
- CGPA 7.5–8.5, knows DSA basics, has 2-3 small projects
- First-gen graduate or family without tech network
- Sends 30+ applications per month, gets <5% response rate
- Doesn't know whether the problem is his resume, his projects, his college name, or all three
- Default move when stuck: ask seniors or post on LinkedIn for advice — both noisy

**Why this user, why now**
- Tier-1 students have placement cells, alumni networks, peer info loops. Tier-2/3 students have none of this.
- Existing tools (LinkedIn Premium, Internshala, Naukri, paid resume reviewers) assume baseline access already exists.
- Most "AI career advice" trains on Tier-1/Western examples and gives advice that doesn't fit the user's actual reality.

---

## What the AI does (load-bearing test)

Remove Claude → tool dies. ✓

Pure keyword matching cannot do this work. The AI does:
1. **Gap reasoning** — what's *missing* from the resume given role norms (not just keyword overlap)
2. **Tier-aware calibration** — fixes proposed must be reachable from the user's actual access position
3. **Confidence scoring** — every claim is labeled high / medium / low based on how speculative the inference is
4. **Time-budget calibration** — fixes are sized to the user's chosen horizon (weekend / 2wk / 1mo / 3mo)

---

## Three things we worried about (the ethical pre-mortem)

### 1. Spam / mass-game harm
**Risk:** A naive "career AI" that generates outreach messages or applications at scale would flood recruiter inboxes and pollute the ecosystem.
**Mitigation built in:** Tool *diagnoses individual fit*, never generates outreach or applications. Different verb. The user has to act on the diagnosis themselves — that's the empowerment, not the replacement.

### 2. Hope harm — false confidence or false despair
**Risk:** AI declaring "you're ready!" when you're not = wasted effort + emotional damage. AI declaring "you're not qualified" when you are = lost opportunity + self-doubt.
**Mitigation built in:** Confidence labels (high / medium / low) on every diagnosis. The "What we cannot tell you" panel is permanently visible. We never produce overall verdicts like "fit" / "not fit" — just specific gaps with calibrated fixes.

### 3. Equity within the user group
**Risk:** Among Tier-2 students, who benefits most? The ones with English fluency, time, laptops, paid courses. The ones who need help most get the least.
**Mitigation built in:** Every diagnosis tags `access_cost: free | paid`. Free-access fixes are present in every result. Time horizons start at "this weekend" so users without months of runway aren't excluded.

### Bonus risk avoided: the "hide your college" trap
A common bad piece of career advice in India is "remove your college name from the top of your resume" or "use only your degree, not the university." We refuse to recommend identity concealment. **Fixes are additive only** — what to ADD or REFRAME truthfully, never what to CONCEAL. This is encoded in the system prompt as a hard rule.

---

## What we cannot tell you (and we say so, prominently)

- Whether you'll pass the actual interview
- How you come across in real conversation
- Whether the recruiter is biased toward your college name
- Whether this specific company is right for you

These are listed in a permanently-visible side panel on the page, not buried in fine print.

---

## When to talk to a real person

Also permanently visible:
- You've been rejected so often it's affecting your mental health → college counselor
- You need career direction, not just resume tweaks → senior or alum who's done what you want
- You're considering hiding facts on your resume → mentor first
- You feel stuck and don't know why → 30-min call beats any tool

---

## Empowerment surfaces (rubric: empower, don't replace)

- **User can disagree** with any diagnosis (per-card "Disagree — dismiss" button)
- **Reasoning is shown by default** — the "why it matters" field is always visible per card
- **Confidence is shown** — user can weight low-confidence items differently
- **Time horizon is user-chosen** — they decide what's realistic for them
- **No autoplay action** — tool gives diagnosis; user decides what to do with it

---

## Tech

- React (single-file artifact)
- Claude Sonnet 4 via `/v1/messages`
- Structured JSON output, defensive parsing (markdown fence stripping + first-{ to last-} extraction)
- No backend, no database, no auth, no storage — resume stays in the browser
- Tailwind CSS for styling
- Lucide icons
- Fonts: Fraunces (serif display) + Instrument Sans (body) — distinctive, editorial feel

**Why single-file artifact instead of full Next.js?** 24h solo + working demo > scaffolded boilerplate. The artifact is shareable as a URL and submits cleanly. If you want a custom domain post-hackathon, the Diagnose component lifts directly into a Next.js `app/page.jsx` with one route handler proxying the API call (so the API key isn't client-side).

---

## Demo script (90 seconds)

[Recorded demo video](https://www.loom.com/share/ba4acb014b074dabb9ecd8f8689dac1a)

```
[0-15s] HOOK
Two resumes. Same skills. Different college names.
The IIT student gets the interview. The HBTU student doesn't.
We can't fix bias overnight. We can show the second student
exactly what they need to ADD — not who to pretend to be.

[15-60s] DEMO
[Click "Try with example"]
Real anonymized resume from a 3rd-year HBTU student.
Real Backend SDE Intern JD from Bangalore.
[Click "Run diagnosis"]
Watch: 4-5 ranked diagnosis cards appear with confidence labels.
Click one to expand: see the issue, why it matters, the specific fix,
the time it'll take, whether it's free or paid.
[Click "Disagree" on one card]
User has the final word. AI doesn't.
Point to the side panel: "What we can't tell you" — permanently visible.

[60-75s] ETHICS
Three things we worried about.
Spam: tool diagnoses individual fit, never generates outreach.
Hope harm: confidence labels on every claim.
Equity: free-access fixes prioritized, paid ones flagged.
Plus: we refuse to teach users to hide their college name.

[75-90s] CLOSE
Built solo, 24 hours.
Roadmap: feedback loop where users report which diagnoses landed jobs,
so the calibration improves over time without the user becoming the product.
Thanks.
```

**Print this. Time it. Cut to 90s.**

---

## Pitch deck — 7 slides

1. **Title** — "Diagnose — Why didn't they call you back?" + your name + track
2. **The person** — Aditya's persona facts (one slide of bullets, big text)
3. **The problem** — Mad Lib problem statement, one sentence, huge font
4. **Demo** — embed a 60-sec recorded video as fallback + live URL link
5. **How AI is load-bearing** — one diagram: input → gap reasoning → calibration → ranked output
6. **Ethics** — three risks, three mitigations, side by side
7. **Validation + roadmap** — Reddit/forum quotes you collected + one-line roadmap

---

## Pre-submission checklist

- [ ] Demo URL works in incognito browser, fresh device
- [ ] README in repo (this file) has: problem, persona, what AI does, harms + mitigations
- [x] Backup demo video uploaded somewhere: https://www.loom.com/share/ba4acb014b074dabb9ecd8f8689dac1a
- [ ] Deck PDF + Google Slides link both work
- [ ] Persona doc + harm scenarios visible in repo (optional: paste this README)
- [ ] One screenshot of real student feedback (Reddit quote / DM screenshot) in repo
- [ ] No API keys leaked in client-side code
- [ ] Phone fully charged, laptop charger packed
- [ ] Practiced pitch live 3x with timer

---

## What's NOT in the v0.1 (and why that's OK)

- ❌ User accounts → not needed for a diagnostic tool
- ❌ Resume PDF parsing → textarea paste is faster + works for the demo
- ❌ Database / history → resume privacy > convenience
- ❌ Multi-language → v1 is English; Hindi is a stated roadmap item
- ❌ Recruiter view / employer dashboard → we are *not* building a job-matching marketplace, on purpose
- ❌ Outreach generation → ethical no, by design

When a judge asks "why didn't you build X?" — the answer is the ethics or the scope decision, both of which score points.

---

## Roadmap (slide 7 talking points)

1. **Feedback loop** — users report which diagnoses led to interviews / offers; calibration improves without the user becoming the product (no resume retention)
2. **Hindi + regional language support** — for the long tail of Tier-3 / non-English-medium students
3. **College-specific calibration** — diagnoses tuned to specific college / region patterns, surfaced from aggregate (anonymous) feedback
4. **Mentor handoff integration** — when the tool says "talk to a human," surface a (curated, vetted) list of alumni mentors willing to help

---

## Built honest. Submitted with my name on it.

If a judge asks one question and you can only give one answer:
*"This tool refuses to teach students to game a biased system by pretending to be someone they're not. It tells them what to add — never what to hide. That's the difference between empowering and exploiting."*

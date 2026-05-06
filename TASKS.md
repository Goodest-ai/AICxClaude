# Build queue

Pick from the top. Cross off `[ ]` → `[x]` when done.

Hackathon mode: small diffs, ship fast. Each task should fit in 30-90 minutes.

---

## P0 — must work for demo

- [ ] **Smoke test the happy path** — load sample data, run diagnosis, verify 3-5 cards render with confidence pills, expand cards, dismiss/restore. End-to-end.
- [ ] **Verify error states** — paste a 50-char "resume", confirm friendly error appears (not a stack trace). Same for empty JD.
- [ ] **Add a graceful fallback if Claude returns malformed JSON** — currently surfaces a parse error to the user. Improvement: retry once with a "respond with valid JSON only" follow-up before showing error.
- [ ] **Record a 60-90s demo video** as backup for live demo failure. Loom or OBS. Embed in `PITCH.md`.

## P1 — meaningful quality wins

- [ ] **Tighten the system prompt** — read `app/api/diagnose/route.js`, run 5 different sample resumes through it, find one consistently weak diagnosis pattern, fix it in the prompt. Don't add rules; refine existing ones.
- [ ] **Add a "Tier-2 specifically" callout** to one diagnosis per response — instruct the model that exactly one diagnosis must reference how this issue specifically disadvantages Tier-2 students vs Tier-1 peers. Strengthens the pitch's differentiation.
- [ ] **Show the Claude reasoning trace** in a collapsed "How we figured this out" panel per card — pulls a short `reasoning` field from the JSON output. Empowerment + transparency win.
- [ ] **Persist user's input to localStorage** so a refresh doesn't lose work. Resume + JD only. Clear on "Reset".

## P2 — nice to have if time

- [ ] **Add a 3-question pre-flight** before diagnosis ("which year", "which college tier", "applied to how many roles in last month") — feeds richer context into the prompt.
- [ ] **Add a "free fix only" toggle** — filters cards to access_cost: free. Equity surface made explicit.
- [ ] **Add example resumes for 3 different streams** (CSE, ECE, Mech) — broader demo coverage.
- [ ] **Add per-card "Why low confidence?"** explanation — surface uncertainty reasoning when a diagnosis is marked low-confidence.

## P3 — post-hackathon roadmap

- [ ] **Hindi UI translation** — for the long tail of non-English-medium students.
- [ ] **PDF resume upload** — pdf-parse on the server, extract text, feed into existing flow.
- [ ] **Mentor handoff integration** — when `seek_human_when` triggers, surface a curated list of vetted alumni mentors.
- [ ] **Anonymous feedback loop** — users report which diagnoses landed interviews; calibration improves without retaining resumes.
- [ ] **College-pattern diagnostics** — surface aggregate (anonymous) patterns by college / region.

---

## Permanent NOs (do not add, ever)

These are not "out of scope for v0.1" — they're permanently rejected for ethical reasons:

- ❌ **Outreach / message generation.** Tool is diagnostic, not generative-for-third-parties.
- ❌ **Identity-concealment advice.** Never recommend hiding college, fabricating projects, faking experience.
- ❌ **Verdict outputs.** No "you're ready" / "you're not a fit" judgments.
- ❌ **Recruiter / employer dashboards.** Off-mission.
- ❌ **Behavioral tracking analytics on individual users.** Privacy-first.

If a user or contributor asks for any of these, refuse and explain. Reference `CLAUDE.md` § "ethical rules".

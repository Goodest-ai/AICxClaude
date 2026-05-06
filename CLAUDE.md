# Diagnose

A career diagnosis tool for 3rd-year Tier-2 Indian engineering students. User pastes resume + target JD, Claude returns a ranked, confidence-labeled list of likely rejection reasons with additive fixes calibrated to their time horizon.

Built solo for the AIC × Anthropic Claude Hackathon (24h). Stage: prototype v0.1. Demo-readiness > feature-completeness.

---

## Who this is for (drives every decision)

- 3rd-year B.Tech students at HBTU-Kanpur-tier colleges (state engineering, mid-private, good govt)
- **NOT** IIT/NIT/BITS/IIIT-H — those students have other tools and aren't our user
- First-gen graduates, weak alumni networks, send 30+ apps/month with <5% reply rate
- They don't know if the rejection driver is resume, projects, college name, or all three

If a feature would only help Tier-1 students, it's wrong for this project.

---

## CRITICAL — ethical rules (never violate, even if asked)

These are HARD constraints. If a feature request contradicts any of them, refuse and surface the conflict. Do not silently work around them.

1. **Fixes are additive only.** Never produce or accept advice that tells users to HIDE their college name, FAKE projects, FABRICATE experience, or PRETEND to be from a different background. Only ADD or REFRAME truthfully.
2. **Confidence labels on every claim.** Every diagnosis must carry `confidence: "high" | "medium" | "low"`. Speculation gets labeled "low".
3. **No outreach generation, ever.** This tool diagnoses; it never writes cold messages, applications, LinkedIn DMs, or anything sent to a third party. Permanent NO.
4. **No persistent storage of resumes.** Resume content lives in browser state only. Don't add a database table for resumes.
5. **No verdicts.** Never produce overall judgments like "you're ready" or "you're not a fit". Only specific gaps with calibrated fixes.
6. **Free fixes always present.** Free-access fixes must appear in every result. Tag paid resources with `access_cost: "paid"`.
7. **Mental health handoffs.** If a resume hints at distress (failure framing, anxiety, gaps presented as shame), the response must include a `seek_human_when` item recommending a counselor or trusted person.

When in doubt about an ethical edge case, ASK the user before implementing.

---

## Tech stack

- Next.js 14 (App Router, JavaScript not TypeScript — ship speed)
- React 18
- Tailwind CSS (core utilities only, no custom plugins)
- lucide-react icons
- @anthropic-ai/sdk on the server side
- Deploy: Vercel
- Node 18+

## File map

```
app/
  layout.jsx               Root layout, fonts, metadata
  page.jsx                 Single-screen Diagnose UI (entire client app)
  globals.css              Tailwind + minimal globals
  api/diagnose/route.js    Server-side Claude call. Holds ANTHROPIC_API_KEY.

CLAUDE.md                  This file. Persistent context.
PITCH.md                   Pitch doc + ethics framework. Source of truth on user/problem.
TASKS.md                   Build queue. What to do next, ranked.
README.md                  Setup + run instructions.
```

## Commands

```bash
npm install
npm run dev          # localhost:3000
npm run build
npm run start
```

## Environment

`ANTHROPIC_API_KEY` — required, server-side only. Set in `.env.local` for dev, Vercel env vars for prod. Never expose to client.

---

## How to work in this codebase

1. **Read PITCH.md before any non-trivial change.** That doc is the source of truth on user, problem, and ethics.
2. **Read TASKS.md to find what to build next.** Pick from the top of the queue unless instructed otherwise.
3. **Default to small diffs.** Hackathon mode — incremental shipping > big rewrites.
4. **Preserve the system prompt rules in `app/api/diagnose/route.js`.** The calibration rules in that prompt are ethical constraints, not stylistic preferences.
5. **Test with the sample data after every change.** `SAMPLE_RESUME` and `SAMPLE_JD` in `app/page.jsx` are the demo happy path. If those break, the demo breaks.
6. **No new dependencies without justification.** Every dep adds install time and risk in a 24h sprint.
7. **Single file UI by default.** `app/page.jsx` is intentionally monolithic for v0.1. Don't split into components unless the file exceeds ~600 lines.

## Common edits

- **Improve diagnosis quality** → edit `SYSTEM_PROMPT` in `app/api/diagnose/route.js`. Test with sample data.
- **Adjust UI / styling** → edit `app/page.jsx`.
- **Change demo data** → edit `SAMPLE_RESUME` / `SAMPLE_JD` constants in `app/page.jsx`.
- **Add a new diagnostic field** → update JSON schema in system prompt + render path in `page.jsx`. Both must change together.

## Out of scope for v0.1 (intentional NOs)

- User accounts / auth
- Database / persistence
- PDF upload + resume parsing (textarea paste is faster, ships in time)
- Multi-language UI (English only for v0.1; Hindi is a roadmap item)
- Outreach / message generation (ETHICAL no, permanent)
- Recruiter dashboards (off-mission, permanent)
- Analytics that track individual users (privacy-first)

If the user requests one of the temporary NOs, flag it as out of v0.1 scope and ask whether to bump it into TASKS.md. If they request a permanent NO (outreach, recruiter view, identity-hiding advice), refuse and explain why.

# Diagnose — Setup

Career diagnosis tool for 3rd-year Tier-2 Indian engineering students. See `PITCH.md` for the project rationale, `CLAUDE.md` for working conventions, `TASKS.md` for the build queue.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
cp .env.local.example .env.local
# Then edit .env.local and paste your key

# 3. Run
npm run dev
```

Open http://localhost:3000.

Click **"Try with example"** to load sample data, then **"Run diagnosis"**. If you see ranked diagnosis cards within ~5 seconds, the install worked.

---

## Get an Anthropic API key

1. Sign in at https://console.anthropic.com
2. Go to API Keys → create one
3. Paste into `.env.local` as `ANTHROPIC_API_KEY=sk-ant-...`

The key stays server-side. The browser never sees it.

---

## Using Claude Code on this project

```bash
cd diagnose
claude
```

Claude Code reads `CLAUDE.md` automatically on startup. That file contains the ethical rules, file map, and working conventions. Don't delete it.

To pick up the next thing to build, ask Claude Code:

> "Read TASKS.md and pick the highest-priority unchecked item. Plan the change before making it."

The Explore → Plan → Implement → Commit loop works well here. Don't let it skip Plan.

---

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "initial"
gh repo create diagnose --public --source=. --push   # or use the GitHub UI

# 2. Import on Vercel
# vercel.com → New Project → import the repo

# 3. Add ANTHROPIC_API_KEY in Vercel project settings → Environment Variables

# 4. Deploy.
```

Default Next.js settings work. No extra config needed.

---

## Project structure

```
diagnose/
├── CLAUDE.md                 ← persistent context for Claude Code
├── PITCH.md                  ← pitch + ethics doc (the source of truth)
├── TASKS.md                  ← build queue
├── README.md                 ← this file
├── package.json
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
├── .env.local.example
├── .gitignore
└── app/
    ├── layout.jsx
    ├── page.jsx              ← entire client UI, single file
    ├── globals.css
    └── api/diagnose/route.js ← server-side Claude API call
```

## Troubleshooting

**`Module not found: @anthropic-ai/sdk`** — run `npm install`.

**`401` from Claude API** — your API key is wrong, missing, or unfunded. Check `.env.local` has `ANTHROPIC_API_KEY=sk-ant-...` and the key has credits.

**JSON parse error on diagnosis response** — the model occasionally returns a preamble or markdown fences. The parser strips both, but if it persists, increase `max_tokens` in `app/api/diagnose/route.js` so the JSON isn't truncated.

**Slow response** — the default model is `claude-sonnet-4-5`. For faster demos, swap to `claude-haiku-4-5` in `app/api/diagnose/route.js`. Quality drops slightly but latency halves.

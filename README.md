# AutoApply — AI-Powered Job Application Platform

> Your personal AI job search co-pilot. Evaluate jobs, auto-fill applications, track your pipeline, schedule follow-ups, prep for interviews, and negotiate offers — all from one local web app.

---

## What it does

| Feature | Description |
|---|---|
| **Job Discovery** | Paste any job URL or description — AI evaluates it instantly |
| **6-Block AI Evaluation** | Gap analysis · seniority fit · comp research · CV suggestions · red flags · interview Q&A |
| **Apply Assist** | Paste the application URL — AI reads every form field and generates copy-paste answers |
| **Cover Letter Generator** | One-click tailored cover letters from your profile |
| **Application Pipeline** | Track every job: new → evaluated → applied → interview → offer |
| **Follow-up Engine** | Auto-schedules day 7, 14, 21 follow-up emails. AI drafts them for you |
| **Interview Prep Coach** | Mock Q&A for any company/role/round + STAR method guide |
| **Offer Negotiation** | Log offers, see your market percentile, get counter-offer & competing-offer scripts |

---

## AI Provider — Anthropic or OpenRouter (free)

You need **one** of these. Pick based on your preference:

### Option A — Anthropic (recommended quality)

| | |
|---|---|
| Sign up | [console.anthropic.com](https://console.anthropic.com) |
| Free credit | **$5 on sign-up** (~1,500 evaluations) |
| Cost per eval | ~$0.003 (less than a cent) |
| Quality | Excellent — Claude handles complex JSON reliably |

### Option B — OpenRouter (100% free tier)

| | |
|---|---|
| Sign up | [openrouter.ai](https://openrouter.ai) |
| Cost | **$0** on free models |
| Rate limit | 20 requests/min · 200 requests/day |
| Quality | Good for basic use, weaker on complex structured output |

**Free models available on OpenRouter:**

| Model | Quality | Speed | Best for |
|---|---|---|---|
| `meta-llama/llama-3.3-70b-instruct:free` | ★★★★ | Medium | Evaluations, scripts (recommended) |
| `meta-llama/llama-3.1-8b-instruct:free` | ★★★ | Fast | Quick follow-up drafts |
| `google/gemma-2-9b-it:free` | ★★★ | Fast | Simple Q&A |
| `mistralai/mistral-7b-instruct:free` | ★★★ | Fast | Cover letters |

**Limitations of free OpenRouter models:**
- 200 requests/day hard cap — evaluating 20+ jobs in a day will hit it
- JSON parsing failures happen occasionally (free models are less instruction-following) — retry if you get a blank result
- No streaming support on some free models
- Response quality for the 6-block evaluation is noticeably weaker than Claude
- Free models can be slow during peak hours (shared infrastructure)

> **Recommendation**: Use OpenRouter free to try the app. Switch to Anthropic ($5 credit) once you want reliable, high-quality output.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **Git** | any | [git-scm.com](https://git-scm.com) |
| **AI API Key** | — | Anthropic or OpenRouter (see above) |

---

## Setup (5 minutes)

### 1. Clone the repo

```bash
git clone https://github.com/sai-sridhar-repo-07/Auto-Apply-Jobs.git
cd Auto-Apply-Jobs/autoapply
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browser (needed for Apply Assist)

```bash
npx playwright install chromium
```

### 4. Configure your AI provider

```bash
cp .env.local.example .env.local
```

Open `.env.local` and choose **one** of these:

**Option A — Anthropic** (recommended)
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```
Get key: [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key

**Option B — OpenRouter** (free tier)
```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
```
Get key: [openrouter.ai](https://openrouter.ai) → Sign in → Keys → Create Key

### 5. Set up your profile

```bash
cp config/profile.example.yml config/profile.yml
```

Open `config/profile.yml` and fill in **your** details:

```yaml
name: "Your Name"
email: "you@email.com"
headline: "Senior Engineer with 5 years..."
target_roles:
  - "Senior Software Engineer"
  - "Staff Engineer"
proof_points:
  - "Reduced API latency by 40%..."
comp_min: 150000
comp_max: 200000
```

> This file drives every AI evaluation, CV suggestion, and negotiation script. The more detail you add, the better the output.

```bash
cp config/portals.example.yml config/portals.yml
# Optional: add companies you want to track
```

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How to use it

```
Settings → Jobs → Applications → Follow-ups → Interview → Negotiate
```

**Step-by-step workflow:**

1. **Settings** — Check the setup checklist and read the profile guide
2. **Discover Jobs** — Paste a job URL + description, click **Evaluate**. Claude runs a 6-block analysis in ~10 seconds
3. **Apply Assist** — When ready to apply, paste the application form URL. AI reads every field and generates answers — you copy-paste and submit
4. **Applications** — Move the job to `applied` when you submit. Follow-ups are auto-scheduled
5. **Follow-ups** — On day 7, 14, and 21, come here to review and send AI-drafted emails
6. **Interview Prep** — Got a call? Enter company + role + round to get tailored mock Q&A
7. **Negotiate** — Got an offer? Log it to see your market percentile and get negotiation scripts

---

## Project structure

```
autoapply/
├── config/
│   ├── profile.example.yml      # Copy to profile.yml — your details
│   └── portals.example.yml      # Copy to portals.yml — target companies
├── src/
│   ├── app/                     # Next.js pages + API routes
│   │   ├── api/                 # Backend endpoints
│   │   └── (pages)/             # UI pages
│   ├── components/              # React components per feature
│   └── lib/
│       ├── ai/                  # Claude AI calls (evaluate, apply, interview, negotiate)
│       ├── db/                  # SQLite schema + queries
│       └── scraper/             # Playwright form scraper
├── data/                        # SQLite database (auto-created, git-ignored)
└── .env.local                   # Your API key (git-ignored, never committed)
```

---

## Tech stack

- **Next.js 16** — full-stack React framework (frontend + API routes)
- **TypeScript** — end-to-end type safety
- **Tailwind CSS + shadcn/ui** — component library
- **SQLite (better-sqlite3)** — local database, zero setup, lives in `data/`
- **Anthropic SDK / OpenAI SDK** — pluggable AI provider (Claude or OpenRouter)
- **Playwright** — headless browser for form field extraction

---

## Data & privacy

- All your data stays **100% on your machine** — the SQLite database lives in `data/autoapply.db`
- Your `profile.yml` and `.env.local` are git-ignored and never committed or pushed
- The only external calls are to Anthropic or OpenRouter (your key, your usage)
- No accounts, no cloud sync, no telemetry

---

## Troubleshooting

**`ANTHROPIC_API_KEY is not set` / `OPENROUTER_API_KEY is not set`**
Make sure `.env.local` exists and `AI_PROVIDER` matches the key you set.

**OpenRouter: blank or broken JSON results**
Free models occasionally fail on complex structured output. Just click Evaluate again — it's a one-off retry. If it keeps failing, switch to a stronger free model (`llama-3.3-70b`) or use Anthropic.

**OpenRouter: `429 Too Many Requests`**
You've hit the 200 req/day or 20 req/min limit on free models. Wait until midnight UTC or switch to a paid model in `.env.local`.

**`Playwright: browser not found`**
Run `npx playwright install chromium` in the `autoapply/` folder.

**`missing named parameter` on job save**
Make sure your `profile.yml` exists and has been filled in (copy from `profile.example.yml`).

**Port 3000 already in use**
```bash
npm run dev -- -p 3001
# then open http://localhost:3001
```

**Database reset** (fresh start)
```bash
rm data/autoapply.db
npm run dev  # database is recreated automatically
```

---

## License

MIT — use it, fork it, build on it.

---

*Built with [Next.js](https://nextjs.org) + [Claude AI](https://anthropic.com)*

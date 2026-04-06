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

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **Git** | any | [git-scm.com](https://git-scm.com) |
| **Anthropic API Key** | — | [console.anthropic.com](https://console.anthropic.com) |

> **Cost**: Anthropic gives **$5 free credit** on sign-up. One full job evaluation costs ~$0.003 (less than a cent). $5 covers ~1,500 evaluations.

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

### 4. Add your Anthropic API key

```bash
cp .env.local.example .env.local
```

Open `.env.local` and replace `REPLACE_WITH_YOUR_KEY` with your actual key:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Get your key at [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key.

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
- **Anthropic SDK** — Claude claude-sonnet-4-6 for all AI features
- **Playwright** — headless browser for form field extraction

---

## Data & privacy

- All your data stays **100% on your machine** — the SQLite database lives in `data/autoapply.db`
- Your `profile.yml` and `.env.local` are git-ignored and never committed or pushed
- The only external calls are to the Anthropic API (your key, your usage)
- No accounts, no cloud sync, no telemetry

---

## Troubleshooting

**`ANTHROPIC_API_KEY` not found**
Make sure `.env.local` exists and the key starts with `sk-ant-`.

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

# AutoApply — AI-Powered Job Application Platform

A full-stack web app that automates and supercharges your job search using Claude AI.

## Features

- **Job Discovery** — Add job URLs, paste descriptions, and get instant AI evaluations
- **6-Block AI Evaluation** — Gap analysis, seniority positioning, comp research, CV suggestions, and interview prep per job
- **Application Pipeline** — Kanban + table tracker with one-click status updates
- **Follow-up Engine** — Auto-scheduled day 7/14/21 follow-up emails, AI-drafted
- **Interview Prep Coach** — Mock Q&A sessions, company research briefs, STAR story guide
- **Offer Negotiation Tracker** — Log offers, market benchmarking, AI counter-offer and competing-offer scripts

## Stack

- **Frontend/Backend**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- **Database**: SQLite (better-sqlite3) — local, fast, no server needed
- **AI**: Claude API (claude-sonnet-4-6) via Anthropic SDK
- **Automation**: Playwright

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/sai-sridhar-repo-07/Auto-Apply-Jobs.git
cd Auto-Apply-Jobs
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
# Get one at https://console.anthropic.com
```

### 3. Set up your profile

```bash
cp config/profile.example.yml config/profile.yml
# Edit config/profile.yml with your details, target roles, and compensation range

cp config/portals.example.yml config/portals.yml
# Edit config/portals.yml to add the companies you want to track
```

### 4. Run

```bash
npm run dev
# Open http://localhost:3000
```

## Usage

1. **Settings** — Read the setup guide and confirm your profile is configured
2. **Discover Jobs** — Paste a job URL and description, click Evaluate
3. **Applications** — Move jobs through the pipeline as you apply and hear back
4. **Follow-ups** — When you mark a job as "applied", day 7/14/21 reminders are auto-scheduled
5. **Interview Prep** — Generate mock Q&A for any company/role/round
6. **Negotiations** — Log offers to get AI-generated negotiation scripts

## Configuration

All user data lives in `config/` (git-ignored, never committed):

| File | Purpose |
|------|---------|
| `config/profile.yml` | Your name, target roles, archetypes, proof points, comp range |
| `config/portals.yml` | Companies to track, keywords to filter |

See the `*.example.yml` files for full documentation of each field.

## License

MIT

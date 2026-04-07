-- JobCraft Database Schema

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ─── Jobs ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  url           TEXT UNIQUE NOT NULL,
  title         TEXT,
  company       TEXT,
  location      TEXT,
  remote        TEXT CHECK(remote IN ('remote','hybrid','onsite','unknown')) DEFAULT 'unknown',
  description   TEXT,
  source        TEXT,           -- linkedin, greenhouse, lever, direct, etc.
  discovered_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_active     INTEGER NOT NULL DEFAULT 1,
  raw_html      TEXT
);

-- ─── Evaluations ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evaluations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id          INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  archetype       TEXT,          -- best matching archetype
  score           REAL,          -- 0-10
  grade           TEXT,          -- A/B/C/D/F
  summary         TEXT,          -- 2-3 sentence summary
  gap_analysis    TEXT,          -- block B JSON
  seniority       TEXT,          -- block C text
  comp_research   TEXT,          -- block D text
  cv_suggestions  TEXT,          -- block E text
  interview_prep  TEXT,          -- block F text
  full_report     TEXT,          -- complete markdown report
  evaluated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Applications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id        INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'evaluated'
                CHECK(status IN ('evaluated','applied','responded','interview','offer','rejected','discarded','skip')),
  applied_at    TEXT,
  notes         TEXT,
  cv_path       TEXT,            -- path to generated PDF
  cover_letter  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Follow-ups ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS followups (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  day           INTEGER NOT NULL CHECK(day IN (7,14,21)),
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK(status IN ('pending','drafted','sent','skipped')),
  draft         TEXT,            -- AI-generated email draft
  sent_at       TEXT,
  due_at        TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Interview Sessions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_sessions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id  INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  session_type    TEXT NOT NULL DEFAULT 'mock'
                  CHECK(session_type IN ('mock','prep','debrief')),
  round           TEXT,          -- phone screen, technical, behavioral, final
  questions       TEXT,          -- JSON array of Q&A pairs
  star_stories    TEXT,          -- JSON array of STAR stories
  company_brief   TEXT,          -- AI-generated company research brief
  score           REAL,          -- 0-10 prep readiness score
  notes           TEXT,
  scheduled_at    TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Offers ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id    INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  company           TEXT,
  role              TEXT,
  base_salary       REAL,
  bonus             REAL,
  equity            TEXT,         -- free-form (e.g. "0.5% over 4 years")
  equity_value      REAL,         -- estimated total value
  benefits          TEXT,
  total_comp        REAL,
  currency          TEXT DEFAULT 'USD',
  market_p25        REAL,
  market_p50        REAL,
  market_p75        REAL,
  counter_script    TEXT,         -- AI-generated negotiation script
  competing_script  TEXT,
  decision          TEXT CHECK(decision IN ('accepted','declined','negotiating','pending')) DEFAULT 'pending',
  received_at       TEXT NOT NULL DEFAULT (datetime('now')),
  deadline_at       TEXT,
  notes             TEXT
);

-- ─── Settings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_discovered ON jobs(discovered_at);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_followups_due ON followups(due_at);
CREATE INDEX IF NOT EXISTS idx_followups_status ON followups(status);

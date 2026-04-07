import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'data', 'autoapply.db')
const SCHEMA_PATH = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db

  // Ensure data directory exists
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  // Run schema if tables don't exist yet
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8')
  _db.exec(schema)

  return _db
}

// ─── Job queries ──────────────────────────────────────────────────────────────

export const jobQueries = {
  getAll: () =>
    getDb().prepare(`
      SELECT j.*,
        (SELECT e.score FROM evaluations e WHERE e.job_id = j.id LIMIT 1) as score,
        (SELECT e.grade FROM evaluations e WHERE e.job_id = j.id LIMIT 1) as grade,
        (SELECT e.archetype FROM evaluations e WHERE e.job_id = j.id LIMIT 1) as archetype,
        (SELECT e.summary FROM evaluations e WHERE e.job_id = j.id LIMIT 1) as summary,
        (SELECT a.status FROM applications a WHERE a.job_id = j.id LIMIT 1) as status,
        (SELECT a.id FROM applications a WHERE a.job_id = j.id LIMIT 1) as application_id
      FROM jobs j
      ORDER BY j.discovered_at DESC
    `).all(),

  getById: (id: number) =>
    getDb().prepare(`SELECT * FROM jobs WHERE id = ?`).get(id),

  upsert: (job: Partial<{ url: string; title: string; company: string; location: string; remote: string; description: string; source: string; is_active: number }>) => {
    const params = {
      url: job.url ?? null,
      title: job.title ?? null,
      company: job.company ?? null,
      location: job.location ?? null,
      remote: job.remote ?? 'unknown',
      description: job.description ?? null,
      source: job.source ?? null,
    };
    return getDb().prepare(`
      INSERT INTO jobs (url, title, company, location, remote, description, source)
      VALUES (@url, @title, @company, @location, @remote, @description, @source)
      ON CONFLICT(url) DO UPDATE SET
        title = excluded.title,
        company = excluded.company,
        location = excluded.location,
        remote = excluded.remote,
        description = excluded.description,
        is_active = 1
    `).run(params);
  },

  count: () => (getDb().prepare(`SELECT COUNT(*) as n FROM jobs`).get() as { n: number }).n,
}

// ─── Evaluation queries ───────────────────────────────────────────────────────

export const evalQueries = {
  getByJobId: (job_id: number) =>
    getDb().prepare(`SELECT * FROM evaluations WHERE job_id = ?`).get(job_id),

  insert: (data: Record<string, unknown>) => {
    const params = {
      job_id: data.job_id ?? null,
      archetype: data.archetype ?? null,
      score: data.score ?? null,
      grade: data.grade ?? null,
      summary: data.summary ?? null,
      gap_analysis: data.gap_analysis ?? null,
      seniority: data.seniority ?? null,
      comp_research: data.comp_research ?? null,
      cv_suggestions: data.cv_suggestions ?? null,
      interview_prep: data.interview_prep ?? null,
      full_report: data.full_report ?? null,
    };
    return getDb().prepare(`
      INSERT OR REPLACE INTO evaluations
        (job_id, archetype, score, grade, summary, gap_analysis, seniority,
         comp_research, cv_suggestions, interview_prep, full_report)
      VALUES
        (@job_id, @archetype, @score, @grade, @summary, @gap_analysis, @seniority,
         @comp_research, @cv_suggestions, @interview_prep, @full_report)
    `).run(params);
  },

  avgScore: () => {
    const row = getDb().prepare(`SELECT AVG(score) as avg FROM evaluations`).get() as { avg: number }
    return row?.avg ?? 0
  },
}

// ─── Application queries ──────────────────────────────────────────────────────

export const appQueries = {
  getAll: () =>
    getDb().prepare(`
      SELECT a.*, j.title, j.company, j.url, j.remote, j.location,
        (SELECT e.score FROM evaluations e WHERE e.job_id = a.job_id LIMIT 1) as score,
        (SELECT e.grade FROM evaluations e WHERE e.job_id = a.job_id LIMIT 1) as grade,
        (SELECT e.archetype FROM evaluations e WHERE e.job_id = a.job_id LIMIT 1) as archetype,
        (SELECT e.summary FROM evaluations e WHERE e.job_id = a.job_id LIMIT 1) as summary
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      ORDER BY a.updated_at DESC
    `).all(),

  getById: (id: number) =>
    getDb().prepare(`
      SELECT a.*, j.title, j.company, j.url, j.remote, j.location,
             e.score, e.grade, e.archetype, e.summary, e.full_report,
             e.gap_analysis, e.seniority, e.comp_research, e.cv_suggestions, e.interview_prep
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      LEFT JOIN evaluations e ON e.job_id = a.job_id
      WHERE a.id = ?
    `).get(id),

  upsert: (job_id: number) =>
    getDb().prepare(`
      INSERT INTO applications (job_id) VALUES (?)
      ON CONFLICT DO NOTHING
    `).run(job_id),

  updateStatus: (id: number, status: string) =>
    getDb().prepare(`
      UPDATE applications SET status = ?, updated_at = datetime('now') WHERE id = ?
    `).run(status, id),

  updateNotes: (id: number, notes: string) =>
    getDb().prepare(`
      UPDATE applications SET notes = ?, updated_at = datetime('now') WHERE id = ?
    `).run(notes, id),

  countByStatus: () =>
    getDb().prepare(`
      SELECT status, COUNT(*) as count FROM applications GROUP BY status
    `).all() as { status: string; count: number }[],
}

// ─── Followup queries ─────────────────────────────────────────────────────────

export const followupQueries = {
  getDue: () =>
    getDb().prepare(`
      SELECT f.*, a.job_id, j.title, j.company, j.url
      FROM followups f
      JOIN applications a ON a.id = f.application_id
      JOIN jobs j ON j.id = a.job_id
      WHERE f.status = 'pending' AND f.due_at <= datetime('now', '+1 day')
      ORDER BY f.due_at ASC
    `).all(),

  getByApplication: (application_id: number) =>
    getDb().prepare(`SELECT * FROM followups WHERE application_id = ?`).all(application_id),

  create: (application_id: number, day: number, due_at: string) =>
    getDb().prepare(`
      INSERT OR IGNORE INTO followups (application_id, day, due_at)
      VALUES (?, ?, ?)
    `).run(application_id, day, due_at),

  updateDraft: (id: number, draft: string) =>
    getDb().prepare(`UPDATE followups SET draft = ?, status = 'drafted' WHERE id = ?`).run(draft, id),

  markSent: (id: number) =>
    getDb().prepare(`UPDATE followups SET status = 'sent', sent_at = datetime('now') WHERE id = ?`).run(id),

  skip: (id: number) =>
    getDb().prepare(`UPDATE followups SET status = 'skipped' WHERE id = ?`).run(id),

  countDue: () => {
    const row = getDb().prepare(`
      SELECT COUNT(*) as n FROM followups
      WHERE status IN ('pending','drafted') AND due_at <= datetime('now', '+1 day')
    `).get() as { n: number }
    return row?.n ?? 0
  },
}

// ─── Interview queries ────────────────────────────────────────────────────────

export const interviewQueries = {
  getByApplication: (application_id: number) =>
    getDb().prepare(`SELECT * FROM interview_sessions WHERE application_id = ? ORDER BY created_at DESC`).all(application_id),

  getById: (id: number) =>
    getDb().prepare(`SELECT * FROM interview_sessions WHERE id = ?`).get(id),

  create: (data: Record<string, unknown>) =>
    getDb().prepare(`
      INSERT INTO interview_sessions
        (application_id, session_type, round, questions, star_stories, company_brief, score, notes, scheduled_at)
      VALUES
        (@application_id, @session_type, @round, @questions, @star_stories, @company_brief, @score, @notes, @scheduled_at)
    `).run(data),

  update: (id: number, data: Record<string, unknown>) =>
    getDb().prepare(`
      UPDATE interview_sessions SET
        questions = COALESCE(@questions, questions),
        star_stories = COALESCE(@star_stories, star_stories),
        score = COALESCE(@score, score),
        notes = COALESCE(@notes, notes)
      WHERE id = @id
    `).run({ ...data, id }),

  count: () => (getDb().prepare(`SELECT COUNT(*) as n FROM interview_sessions`).get() as { n: number }).n,
}

// ─── Offer queries ────────────────────────────────────────────────────────────

export const offerQueries = {
  getAll: () =>
    getDb().prepare(`
      SELECT o.*,
        COALESCE(o.company, j.company) as company,
        COALESCE(o.role, j.title) as title,
        a.status as app_status
      FROM offers o
      LEFT JOIN applications a ON a.id = o.application_id
      LEFT JOIN jobs j ON j.id = a.job_id
      ORDER BY o.received_at DESC
    `).all(),

  getByApplication: (application_id: number) =>
    getDb().prepare(`SELECT * FROM offers WHERE application_id = ?`).get(application_id),

  create: (data: Record<string, unknown>) =>
    getDb().prepare(`
      INSERT INTO offers
        (application_id, company, role, base_salary, bonus, equity, equity_value, benefits,
         total_comp, currency, market_p25, market_p50, market_p75, deadline_at, notes)
      VALUES
        (@application_id, @company, @role, @base_salary, @bonus, @equity, @equity_value, @benefits,
         @total_comp, @currency, @market_p25, @market_p50, @market_p75, @deadline_at, @notes)
    `).run(data),

  update: (id: number, data: Record<string, unknown>) =>
    getDb().prepare(`
      UPDATE offers SET
        base_salary = COALESCE(@base_salary, base_salary),
        bonus = COALESCE(@bonus, bonus),
        equity = COALESCE(@equity, equity),
        total_comp = COALESCE(@total_comp, total_comp),
        counter_script = COALESCE(@counter_script, counter_script),
        competing_script = COALESCE(@competing_script, competing_script),
        decision = COALESCE(@decision, decision),
        notes = COALESCE(@notes, notes)
      WHERE id = @id
    `).run({ ...data, id }),

  count: () => (getDb().prepare(`SELECT COUNT(*) as n FROM offers`).get() as { n: number }).n,
}

// ─── Settings queries ─────────────────────────────────────────────────────────

export const settingsQueries = {
  get: (key: string) => {
    const row = getDb().prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as { value: string } | undefined
    return row?.value ?? null
  },
  set: (key: string, value: string) =>
    getDb().prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`).run(key, value),
  getAll: () =>
    getDb().prepare(`SELECT key, value FROM settings`).all() as { key: string; value: string }[],
}

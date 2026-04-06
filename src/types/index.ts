// ─── Database Models ──────────────────────────────────────────────────────────

export interface Job {
  id: number
  url: string
  title: string | null
  company: string | null
  location: string | null
  remote: 'remote' | 'hybrid' | 'onsite' | 'unknown'
  description: string | null
  source: string | null
  discovered_at: string
  is_active: number
  raw_html?: string | null
}

export interface Evaluation {
  id: number
  job_id: number
  archetype: string | null
  score: number | null
  grade: string | null
  summary: string | null
  gap_analysis: string | null
  seniority: string | null
  comp_research: string | null
  cv_suggestions: string | null
  interview_prep: string | null
  full_report: string | null
  evaluated_at: string
}

export type ApplicationStatus =
  | 'evaluated'
  | 'applied'
  | 'responded'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'discarded'
  | 'skip'

export interface Application {
  id: number
  job_id: number
  status: ApplicationStatus
  applied_at: string | null
  notes: string | null
  cv_path: string | null
  cover_letter: string | null
  created_at: string
  updated_at: string
  // Joined fields
  job?: Job
  evaluation?: Evaluation
}

export type FollowupDay = 7 | 14 | 21
export type FollowupStatus = 'pending' | 'drafted' | 'sent' | 'skipped'

export interface Followup {
  id: number
  application_id: number
  day: FollowupDay
  status: FollowupStatus
  draft: string | null
  sent_at: string | null
  due_at: string
  created_at: string
}

export interface InterviewSession {
  id: number
  application_id: number
  session_type: 'mock' | 'prep' | 'debrief'
  round: string | null
  questions: string | null  // JSON
  star_stories: string | null  // JSON
  company_brief: string | null
  score: number | null
  notes: string | null
  scheduled_at: string | null
  created_at: string
}

export interface Offer {
  id: number
  application_id: number
  base_salary: number | null
  bonus: number | null
  equity: string | null
  equity_value: number | null
  benefits: string | null
  total_comp: number | null
  currency: string
  market_p25: number | null
  market_p50: number | null
  market_p75: number | null
  counter_script: string | null
  competing_script: string | null
  decision: 'accepted' | 'declined' | 'negotiating' | 'pending'
  received_at: string
  deadline_at: string | null
  notes: string | null
}

// ─── Config Types ─────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string
  email: string
  phone?: string
  linkedin?: string
  github?: string
  website?: string
  location: string
  timezone: string
  visa_sponsorship: boolean
  target_roles: string[]
  archetypes: string[]
  headline: string
  summary: string
  superpowers: string[]
  proof_points: string[]
  comp_min: number
  comp_max: number
  currency: string
  remote_preference: 'remote' | 'hybrid' | 'onsite' | 'any'
}

export interface Portal {
  name: string
  url: string
  careers_url?: string
  greenhouse_id?: string
  lever_id?: string
  category?: string
}

export interface PortalsConfig {
  positive_keywords: string[]
  negative_keywords: string[]
  companies: Portal[]
  job_boards: string[]
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface DashboardStats {
  total_jobs: number
  evaluated: number
  applied: number
  interviews: number
  offers: number
  rejected: number
  followups_due: number
  avg_score: number
}

export interface EvaluationResult {
  archetype: string
  score: number
  grade: string
  summary: string
  gap_analysis: GapItem[]
  seniority: string
  comp_research: CompData
  cv_suggestions: string[]
  interview_prep: StarStory[]
  full_report: string
}

export interface GapItem {
  requirement: string
  status: 'strong' | 'partial' | 'gap'
  note: string
}

export interface CompData {
  min: number
  mid: number
  max: number
  currency: string
  notes: string
}

export interface StarStory {
  question: string
  situation: string
  task: string
  action: string
  result: string
}

export interface QAPair {
  question: string
  answer: string
  score?: number
  feedback?: string
}

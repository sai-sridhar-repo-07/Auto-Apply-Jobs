import { ask } from './claude'
import { getProfile } from '@/lib/config'
import type { EvaluationResult, GapItem, CompData, StarStory } from '@/types'

function buildSystemPrompt(profile: ReturnType<typeof getProfile>): string {
  return `You are an expert career coach and job application strategist.

You evaluate job descriptions against a candidate's profile and produce structured, actionable reports.

CANDIDATE PROFILE:
- Name: ${profile.name}
- Headline: ${profile.headline}
- Target Roles: ${profile.target_roles.join(', ')}
- Location: ${profile.location} | Remote preference: ${profile.remote_preference}
- Comp range: ${profile.currency} ${profile.comp_min.toLocaleString()}–${profile.comp_max.toLocaleString()}
- Superpowers: ${profile.superpowers.join('; ')}
- Proof points: ${profile.proof_points.join('; ')}
- Archetypes: ${Array.isArray(profile.archetypes) ? profile.archetypes.map((a: unknown) => (typeof a === 'object' && a !== null && 'name' in a) ? (a as { name: string }).name : String(a)).join(', ') : ''}

Evaluate with equal rigor across ALL archetypes. Be honest about gaps — the candidate benefits from knowing.`
}

export async function evaluateJob(
  jobDescription: string,
  company: string,
  title: string
): Promise<EvaluationResult> {
  const profile = getProfile()
  const system = buildSystemPrompt(profile)

  const prompt = `Evaluate this job opportunity for the candidate described in your system prompt.

COMPANY: ${company}
ROLE: ${title}

JOB DESCRIPTION:
${jobDescription}

Return a JSON object with EXACTLY this structure (no markdown, raw JSON only):
{
  "archetype": "best matching archetype name",
  "score": 7.5,
  "grade": "B+",
  "summary": "2-3 sentence plain-English summary of fit",
  "gap_analysis": [
    { "requirement": "5+ years TypeScript", "status": "strong", "note": "8 years TypeScript" },
    { "requirement": "Kubernetes experience", "status": "gap", "note": "No direct K8s experience, but Docker/ECS background" }
  ],
  "seniority": "Senior IC (L5 equivalent). The role titles it as Staff but scope is L5. Negotiate at L5 band.",
  "comp_research": {
    "min": 160000,
    "mid": 200000,
    "max": 240000,
    "currency": "USD",
    "notes": "Based on company size, location, and role scope. Equity band likely $30-60K/yr."
  },
  "cv_suggestions": [
    "Lead with the distributed systems proof point",
    "Add Kafka to skills section — role mentions event streaming twice",
    "Quantify team size you managed"
  ],
  "interview_prep": [
    {
      "question": "Tell me about a time you improved system reliability",
      "situation": "Our payments API was hitting 99.2% uptime with recurring incidents",
      "task": "I was tasked with bringing it to 99.9% within one quarter",
      "action": "Audited failure modes, added circuit breakers, implemented graceful degradation",
      "result": "Achieved 99.95% uptime, reduced on-call pages by 70%"
    }
  ],
  "full_report": "## Full Evaluation Report\\n\\n[Complete markdown report here with all sections]"
}

Grade scale: A (9-10), B (7-8), C (5-6), D (3-4), F (<3)
Status values for gap_analysis: "strong" | "partial" | "gap"`

  const raw = await ask(system, prompt, 8192)

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()

  try {
    return JSON.parse(cleaned) as EvaluationResult
  } catch {
    // Fallback: extract what we can
    return {
      archetype: 'Unknown',
      score: 0,
      grade: 'F',
      summary: 'Evaluation failed to parse. Raw output stored in full_report.',
      gap_analysis: [] as GapItem[],
      seniority: '',
      comp_research: { min: 0, mid: 0, max: 0, currency: 'USD', notes: '' } as CompData,
      cv_suggestions: [],
      interview_prep: [] as StarStory[],
      full_report: raw,
    }
  }
}

export async function generateFollowupEmail(
  company: string,
  role: string,
  appliedAt: string,
  day: number,
  candidateName: string
): Promise<string> {
  const system = `You write concise, professional, non-pushy follow-up emails for job applications.
The tone is confident but respectful. Never beg. Keep it under 150 words.`

  const prompt = `Write a day-${day} follow-up email for:
- Candidate: ${candidateName}
- Company: ${company}
- Role: ${role}
- Applied: ${appliedAt}
- Follow-up day: ${day} (${day === 7 ? 'first gentle check-in' : day === 14 ? 'second follow-up, slightly more direct' : 'final follow-up, acknowledge they may have moved on'})

Return only the email body — no subject line, no JSON wrapper.`

  return ask(system, prompt, 512)
}

export async function generateCompanyBrief(company: string, role: string): Promise<string> {
  const system = `You are a research analyst who prepares concise company briefs for job candidates preparing for interviews.`

  const prompt = `Prepare a structured interview prep brief for:
- Company: ${company}
- Role: ${role}

Cover: company mission, recent news/products, culture signals, likely interview process, 3 smart questions to ask.
Keep it under 500 words, use markdown headers.`

  return ask(system, prompt, 1024)
}

export async function generateNegotiationScript(
  company: string,
  role: string,
  offer: { base: number; bonus?: number; equity?: string; currency: string },
  market: { p25: number; p50: number; p75: number },
  mode: 'counter' | 'competing'
): Promise<string> {
  const system = `You write clear, professional salary negotiation scripts. Be direct and confident. Use specific numbers.`

  const prompt = `Write a ${mode === 'counter' ? 'counter-offer' : 'competing offer leverage'} script for:
- Company: ${company}
- Role: ${role}
- Current offer: ${offer.currency} ${offer.base.toLocaleString()} base${offer.bonus ? ` + $${offer.bonus.toLocaleString()} bonus` : ''}${offer.equity ? ` + ${offer.equity} equity` : ''}
- Market data: p25=$${market.p25.toLocaleString()}, p50=$${market.p50.toLocaleString()}, p75=$${market.p75.toLocaleString()}

Return a script the candidate can read or adapt for a phone/email negotiation. Under 300 words.`

  return ask(system, prompt, 1024)
}

export async function generateMockInterview(
  company: string,
  role: string,
  round: string,
  profile: ReturnType<typeof getProfile>
): Promise<{ questions: Array<{ question: string; hint: string }>; briefing: string }> {
  const system = `You are a senior interviewer who generates realistic, challenging interview questions tailored to the specific role and company.`

  const prompt = `Generate 6 interview questions for:
- Company: ${company}
- Role: ${role}
- Round: ${round}
- Candidate background: ${profile.headline}

Mix of: 2 behavioral (STAR), 2 technical/domain, 1 role-specific, 1 "why this company".

Return JSON only:
{
  "questions": [
    { "question": "...", "hint": "what a strong answer should cover" }
  ],
  "briefing": "One paragraph on what to emphasize in this round"
}`

  const raw = await ask(system, prompt, 2048)
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return { questions: [], briefing: raw }
  }
}

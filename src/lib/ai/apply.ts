import { ask } from "./claude";
import { getProfile } from "@/lib/config";
import type { FormField } from "@/lib/scraper/form";
import fs from "fs";
import path from "path";

export interface FieldAnswer {
  field: FormField;
  answer: string;
  confidence: "high" | "medium" | "low";
  note?: string;
}

function loadCv(): string {
  const cvPath = path.join(process.cwd(), "config", "cv.md");
  if (fs.existsSync(cvPath)) return fs.readFileSync(cvPath, "utf-8");
  return "";
}

function buildCandidateContext(profile: ReturnType<typeof getProfile>, cv: string): string {
  return `
CANDIDATE PROFILE:
- Name: ${profile.name}
- Email: ${profile.email}
- Phone: ${profile.phone ?? "Not specified"}
- Location: ${profile.location}
- LinkedIn: ${profile.linkedin ?? "Not specified"}
- GitHub: ${profile.github ?? "Not specified"}
- Website: ${profile.website ?? "Not specified"}
- Timezone: ${profile.timezone}
- Visa sponsorship required: ${profile.visa_sponsorship ? "Yes" : "No"}
- Remote preference: ${profile.remote_preference}
- Target roles: ${profile.target_roles.join(", ")}
- Headline: ${profile.headline}
- Summary: ${profile.summary}
- Compensation range: ${profile.currency} ${profile.comp_min.toLocaleString()}–${profile.comp_max.toLocaleString()}
- Superpowers: ${profile.superpowers.join("; ")}
- Proof points: ${profile.proof_points.join("; ")}

${cv ? `RESUME / CV:\n${cv}` : ""}
`.trim();
}

export async function generateFieldAnswers(
  fields: FormField[],
  company: string,
  role: string,
  jobDescription: string
): Promise<FieldAnswer[]> {
  if (fields.length === 0) return [];

  const profile = getProfile();
  const cv = loadCv();
  const candidateContext = buildCandidateContext(profile, cv);

  const fieldList = fields
    .map((f, i) => {
      let line = `${i + 1}. [${f.type.toUpperCase()}] "${f.label}"`;
      if (f.required) line += " (REQUIRED)";
      if (f.options?.length) line += `\n   Options: ${f.options.join(" | ")}`;
      if (f.placeholder) line += `\n   Placeholder: ${f.placeholder}`;
      return line;
    })
    .join("\n\n");

  const system = `You are an expert job application assistant. You fill out job application forms on behalf of candidates using their profile data.

Rules:
- Be accurate — only use information from the candidate's profile. Never invent credentials.
- Be concise for short fields (name, email, phone, location).
- For cover letters or "why this company" fields, write 2-3 compelling paragraphs (150-250 words).
- For behavioral questions ("tell me about a time..."), use STAR format, 100-150 words.
- For yes/no or work authorization questions, answer based on profile.
- For salary fields, use the midpoint of the candidate's range.
- For file upload fields, return "Upload your CV PDF" as the answer.
- For "how did you hear about us" fields, say "LinkedIn" unless context suggests otherwise.
- Confidence: "high" = directly in profile, "medium" = can be derived, "low" = best guess.`;

  const prompt = `Fill out this job application for the candidate described below.

COMPANY: ${company}
ROLE: ${role}
${jobDescription ? `\nJOB DESCRIPTION SUMMARY:\n${jobDescription.slice(0, 800)}` : ""}

${candidateContext}

APPLICATION FORM FIELDS:
${fieldList}

Return a JSON array — one entry per field, in the same order:
[
  {
    "field_index": 0,
    "answer": "the answer to paste in",
    "confidence": "high",
    "note": "optional note for the candidate"
  }
]

Return raw JSON only — no markdown fences.`;

  const raw = await ask(system, prompt, 4096);
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  let parsed: Array<{ field_index: number; answer: string; confidence: string; note?: string }>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback: return empty answers
    return fields.map((field) => ({
      field,
      answer: "",
      confidence: "low" as const,
      note: "Could not parse AI response",
    }));
  }

  return fields.map((field, i) => {
    const match = parsed.find((p) => p.field_index === i) ?? parsed[i];
    return {
      field,
      answer: match?.answer ?? "",
      confidence: (match?.confidence as FieldAnswer["confidence"]) ?? "low",
      note: match?.note,
    };
  });
}

export async function generateCoverLetter(
  company: string,
  role: string,
  jobDescription: string
): Promise<string> {
  const profile = getProfile();
  const cv = loadCv();

  const system = `You write compelling, personalized cover letters. They are concise (3 paragraphs, under 250 words), specific to the role, and avoid generic phrases like "I am excited to apply".`;

  const prompt = `Write a cover letter for:
- Candidate: ${profile.name}
- Company: ${company}
- Role: ${role}
- Headline: ${profile.headline}
- Key proof points: ${profile.proof_points.slice(0, 3).join("; ")}
- Superpowers: ${profile.superpowers.slice(0, 2).join("; ")}
${jobDescription ? `\nJob description highlights:\n${jobDescription.slice(0, 600)}` : ""}

Format: 3 paragraphs. Opening (why this role/company), Middle (2-3 specific proof points), Close (call to action).
No "Dear Hiring Manager" — start directly with a compelling first sentence.`;

  return ask(system, prompt, 1024);
}

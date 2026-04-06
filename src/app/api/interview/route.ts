import { NextResponse } from "next/server";
import { interviewQueries } from "@/lib/db";
import { generateMockInterview, generateCompanyBrief } from "@/lib/ai/evaluate";
import { getProfile } from "@/lib/config";
import { z } from "zod";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const application_id = searchParams.get("application_id");
  try {
    if (application_id) {
      const sessions = interviewQueries.getByApplication(Number(application_id));
      return NextResponse.json({ success: true, data: sessions });
    }
    return NextResponse.json({ success: false, error: "application_id required" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

const createSchema = z.object({
  application_id: z.number().nullable().default(null).transform(v => (v === 0 ? null : v)),
  company: z.string(),
  role: z.string(),
  round: z.string().default("general"),
  session_type: z.enum(["mock", "prep", "debrief"]).default("mock"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { application_id, company, role, round, session_type } = createSchema.parse(body);
    const profile = getProfile();

    const [mockData, companyBrief] = await Promise.all([
      generateMockInterview(company, role, round, profile),
      generateCompanyBrief(company, role),
    ]);

    const sessionId = interviewQueries.create({
      application_id,
      session_type,
      round,
      questions: JSON.stringify(mockData.questions),
      star_stories: null,
      company_brief: companyBrief,
      score: null,
      notes: mockData.briefing,
      scheduled_at: null,
    });

    return NextResponse.json({ success: true, data: { id: sessionId.lastInsertRowid, ...mockData, company_brief: companyBrief } });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { jobQueries, evalQueries, appQueries } from "@/lib/db";
import { evaluateJob } from "@/lib/ai/evaluate";
import { z } from "zod";

const schema = z.object({ job_id: z.number() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { job_id } = schema.parse(body);

    const job = jobQueries.getById(job_id) as { title: string; company: string; description: string } | undefined;
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    if (!job.description) return NextResponse.json({ success: false, error: "Job has no description to evaluate" }, { status: 400 });

    const result = await evaluateJob(job.description, job.company ?? "", job.title ?? "");

    evalQueries.insert({
      job_id,
      archetype: result.archetype,
      score: result.score,
      grade: result.grade,
      summary: result.summary,
      gap_analysis: JSON.stringify(result.gap_analysis),
      seniority: result.seniority,
      comp_research: JSON.stringify(result.comp_research),
      cv_suggestions: JSON.stringify(result.cv_suggestions),
      interview_prep: JSON.stringify(result.interview_prep),
      full_report: result.full_report,
    });

    // Auto-create application
    appQueries.upsert(job_id);

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

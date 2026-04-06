import { NextResponse } from "next/server";
import { jobQueries, appQueries } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  try {
    const jobs = jobQueries.getAll();
    return NextResponse.json({ success: true, data: jobs });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

const addJobSchema = z.object({
  url: z.string().transform((val) => {
    const trimmed = val.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return "https://" + trimmed;
    }
    return trimmed;
  }).pipe(z.string().url("Please enter a valid job URL")),
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  remote: z.enum(["remote", "hybrid", "onsite", "unknown"]).optional().default("unknown"),
  description: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = addJobSchema.parse(body);
    const result = jobQueries.upsert(data);
    // Create application entry
    if (result.lastInsertRowid) {
      appQueries.upsert(Number(result.lastInsertRowid));
    }
    return NextResponse.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (err) {
    const message = err instanceof z.ZodError
      ? err.issues.map((i: { message: string }) => i.message).join(", ")
      : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { scrapeApplicationForm } from "@/lib/scraper/form";
import { generateFieldAnswers, generateCoverLetter, generateTailoredResume } from "@/lib/ai/apply";
import { z } from "zod";

const schema = z.object({
  url: z.string().url(),
  company: z.string().optional(),
  role: z.string().optional(),
  job_description: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, company: manualCompany, role: manualRole, job_description } = schema.parse(body);

    // Step 1: Scrape the form
    const scraped = await scrapeApplicationForm(url);

    if (scraped.error && scraped.fields.length === 0) {
      return NextResponse.json(
        { success: false, error: `Could not load the page: ${scraped.error}` },
        { status: 400 }
      );
    }

    const company = manualCompany ?? scraped.company ?? "Unknown Company";
    const role = manualRole ?? scraped.role ?? "Unknown Role";

    // Step 2: Generate AI answers for all fields
    const answers = await generateFieldAnswers(
      scraped.fields,
      company,
      role,
      job_description ?? ""
    );

    return NextResponse.json({
      success: true,
      data: {
        company,
        role,
        fields_found: scraped.fields.length,
        answers,
        screenshot: scraped.screenshot,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// Tailored resume generation
export async function PATCH(req: Request) {
  try {
    const { company, role, job_description } = await req.json();
    if (!company || !role) {
      return NextResponse.json({ success: false, error: "company and role required" }, { status: 400 });
    }
    const resume = await generateTailoredResume(company, role, job_description ?? "");
    return NextResponse.json({ success: true, data: { resume } });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// Standalone cover letter generation
export async function PUT(req: Request) {
  try {
    const { company, role, job_description } = await req.json();
    if (!company || !role) {
      return NextResponse.json({ success: false, error: "company and role required" }, { status: 400 });
    }
    const letter = await generateCoverLetter(company, role, job_description ?? "");
    return NextResponse.json({ success: true, data: { cover_letter: letter } });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

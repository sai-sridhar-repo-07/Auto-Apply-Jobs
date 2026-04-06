import { NextResponse } from "next/server";
import { generateResumePdf } from "@/lib/resume/pdf";

export async function POST(req: Request) {
  try {
    const { markdown, filename } = await req.json();
    if (!markdown) {
      return NextResponse.json({ success: false, error: "markdown is required" }, { status: 400 });
    }

    const pdfBuffer = await generateResumePdf(markdown);
    const name = (filename ?? "resume").replace(/[^a-z0-9\-_]/gi, "-").toLowerCase();

    return new Response(pdfBuffer.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}.pdf"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

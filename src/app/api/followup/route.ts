import { NextResponse } from "next/server";
import { followupQueries, appQueries, jobQueries } from "@/lib/db";
import { generateFollowupEmail } from "@/lib/ai/evaluate";
import { getProfile } from "@/lib/config";
import { z } from "zod";

export async function GET() {
  try {
    const due = followupQueries.getDue();
    return NextResponse.json({ success: true, data: due });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

const actionSchema = z.object({
  id: z.number(),
  action: z.enum(["draft", "mark_sent", "skip"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, action } = actionSchema.parse(body);

    if (action === "draft") {
      const followups = followupQueries.getDue() as Array<{
        id: number; day: number; application_id: number; title: string; company: string
      }>;
      const fu = followups.find((f) => f.id === id);
      if (!fu) return NextResponse.json({ success: false, error: "Follow-up not found" }, { status: 404 });

      const app = appQueries.getById(fu.application_id) as { applied_at: string } | undefined;
      const profile = getProfile();

      const draft = await generateFollowupEmail(
        fu.company,
        fu.title,
        app?.applied_at ?? "recently",
        fu.day,
        profile.name
      );
      followupQueries.updateDraft(id, draft);
      return NextResponse.json({ success: true, data: { draft } });
    }

    if (action === "mark_sent") {
      followupQueries.markSent(id);
      return NextResponse.json({ success: true });
    }

    if (action === "skip") {
      followupQueries.skip(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { appQueries, followupQueries } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  try {
    const apps = appQueries.getAll();
    return NextResponse.json({ success: true, data: apps });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

const updateSchema = z.object({
  id: z.number(),
  status: z.enum(["evaluated", "applied", "responded", "interview", "offer", "rejected", "discarded", "skip"]).optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, notes } = updateSchema.parse(body);

    if (status) {
      appQueries.updateStatus(id, status);

      // When marking as applied, schedule follow-ups
      if (status === "applied") {
        const now = new Date();
        for (const day of [7, 14, 21]) {
          const due = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
          followupQueries.create(id, day, due.toISOString());
        }
      }
    }

    if (notes !== undefined) appQueries.updateNotes(id, notes);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 400 });
  }
}

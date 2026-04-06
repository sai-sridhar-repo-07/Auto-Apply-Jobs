import { NextResponse } from "next/server";
import { offerQueries } from "@/lib/db";
import { generateNegotiationScript } from "@/lib/ai/evaluate";
import { z } from "zod";

export async function GET() {
  try {
    const offers = offerQueries.getAll();
    return NextResponse.json({ success: true, data: offers });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

const createSchema = z.object({
  application_id: z.number().nullable().default(null).transform(v => (v === 0 ? null : v)),
  company: z.string(),
  role: z.string(),
  base_salary: z.number(),
  bonus: z.number().optional(),
  equity: z.string().optional(),
  equity_value: z.number().optional(),
  benefits: z.string().optional(),
  total_comp: z.number().optional(),
  currency: z.string().default("USD"),
  deadline_at: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    // Fetch market data estimate (simplified - in production, integrate Levels.fyi/Glassdoor API)
    const market = {
      p25: Math.round(data.base_salary * 0.85),
      p50: Math.round(data.base_salary * 1.0),
      p75: Math.round(data.base_salary * 1.2),
    };

    const [counterScript, competingScript] = await Promise.all([
      generateNegotiationScript(
        data.company, data.role,
        { base: data.base_salary, bonus: data.bonus, equity: data.equity, currency: data.currency },
        market, "counter"
      ),
      generateNegotiationScript(
        data.company, data.role,
        { base: data.base_salary, bonus: data.bonus, equity: data.equity, currency: data.currency },
        market, "competing"
      ),
    ]);

    const result = offerQueries.create({
      ...data,
      market_p25: market.p25,
      market_p50: market.p50,
      market_p75: market.p75,
      counter_script: counterScript,
      competing_script: competingScript,
    });

    return NextResponse.json({ success: true, data: { id: result.lastInsertRowid, counter_script: counterScript, competing_script: competingScript, market } });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

const updateSchema = z.object({
  id: z.number(),
  decision: z.enum(["accepted", "declined", "negotiating", "pending"]).optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = updateSchema.parse(body);
    offerQueries.update(id, updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 400 });
  }
}

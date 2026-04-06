import { NextResponse } from "next/server";
import { appQueries, evalQueries, followupQueries, interviewQueries, offerQueries, jobQueries } from "@/lib/db";
import type { DashboardStats } from "@/types";

export async function GET() {
  try {
    const statusCounts = appQueries.countByStatus();
    const countMap: Record<string, number> = {};
    for (const row of statusCounts) countMap[row.status] = row.count;

    const stats: DashboardStats = {
      total_jobs: jobQueries.count(),
      evaluated: countMap["evaluated"] ?? 0,
      applied: (countMap["applied"] ?? 0) + (countMap["responded"] ?? 0),
      interviews: countMap["interview"] ?? 0,
      offers: countMap["offer"] ?? 0,
      rejected: countMap["rejected"] ?? 0,
      followups_due: followupQueries.countDue(),
      avg_score: Math.round((evalQueries.avgScore() ?? 0) * 10) / 10,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

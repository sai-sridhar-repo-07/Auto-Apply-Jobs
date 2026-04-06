"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search, Briefcase, MessageSquare, FileText, DollarSign,
  XCircle, Bell, TrendingUp
} from "lucide-react";
import type { DashboardStats } from "@/types";

const statCards = [
  { key: "total_jobs", label: "Jobs Discovered", icon: Search, color: "text-blue-500" },
  { key: "evaluated", label: "Evaluated", icon: TrendingUp, color: "text-purple-500" },
  { key: "applied", label: "Applied", icon: Briefcase, color: "text-green-500" },
  { key: "interviews", label: "Interviews", icon: FileText, color: "text-yellow-500" },
  { key: "offers", label: "Offers", icon: DollarSign, color: "text-emerald-500" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-400" },
  { key: "followups_due", label: "Follow-ups Due", icon: Bell, color: "text-orange-500" },
  { key: "avg_score", label: "Avg. Score", icon: TrendingUp, color: "text-cyan-500" },
];

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, color }) => (
          <Card key={key}>
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <span className="text-4xl font-bold">
                {stats ? String(stats[key as keyof DashboardStats]) : "—"}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <a href="/jobs" className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
            <Search className="w-4 h-4" /> Discover Jobs
          </a>
          <a href="/applications" className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium">
            <Briefcase className="w-4 h-4" /> View Pipeline
          </a>
          <a href="/followup" className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium">
            <MessageSquare className="w-4 h-4" /> Check Follow-ups
          </a>
          <a href="/negotiate" className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium">
            <DollarSign className="w-4 h-4" /> Track Offers
          </a>
        </CardContent>
      </Card>

      {/* Empty state */}
      {stats?.total_jobs === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-base font-medium">No jobs yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Go to <strong>Discover Jobs</strong> to paste a job URL or scan company portals.
              Configure your profile in <code className="font-mono bg-muted px-1.5 rounded">config/profile.yml</code> first.
            </p>
            <a href="/settings" className="inline-flex mt-1 text-sm text-primary underline underline-offset-2">
              Open Settings →
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

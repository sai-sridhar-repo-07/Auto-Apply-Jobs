"use client";

import { useEffect, useState } from "react";
import { Search, Briefcase, MessageSquare, FileText, DollarSign, XCircle, Bell, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import type { DashboardStats } from "@/types";

const statCards = [
  { key: "total_jobs", label: "Jobs Found", icon: Search, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50", text: "text-blue-600" },
  { key: "evaluated", label: "Evaluated", icon: Sparkles, gradient: "from-violet-500 to-purple-500", bg: "bg-violet-50", text: "text-violet-600" },
  { key: "applied", label: "Applied", icon: Briefcase, gradient: "from-indigo-500 to-blue-500", bg: "bg-indigo-50", text: "text-indigo-600" },
  { key: "interviews", label: "Interviews", icon: FileText, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50", text: "text-amber-600" },
  { key: "offers", label: "Offers", icon: DollarSign, gradient: "from-emerald-500 to-green-500", bg: "bg-emerald-50", text: "text-emerald-600" },
  { key: "rejected", label: "Rejected", icon: XCircle, gradient: "from-rose-500 to-red-500", bg: "bg-rose-50", text: "text-rose-600" },
  { key: "followups_due", label: "Follow-ups Due", icon: Bell, gradient: "from-orange-500 to-amber-500", bg: "bg-orange-50", text: "text-orange-600" },
  { key: "avg_score", label: "Avg. Score", icon: TrendingUp, gradient: "from-teal-500 to-cyan-500", bg: "bg-teal-50", text: "text-teal-600" },
];

const quickActions = [
  { href: "/jobs", label: "Discover Jobs", icon: Search, desc: "Find and evaluate new roles", color: "bg-indigo-600 hover:bg-indigo-700" },
  { href: "/apply", label: "Apply Assist", icon: Sparkles, desc: "AI fills the form for you", color: "bg-violet-600 hover:bg-violet-700" },
  { href: "/followup", label: "Follow-ups", icon: MessageSquare, desc: "Check pending emails", color: "bg-blue-600 hover:bg-blue-700" },
  { href: "/negotiate", label: "Track Offers", icon: DollarSign, desc: "Compare and negotiate", color: "bg-emerald-600 hover:bg-emerald-700" },
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

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, gradient, bg, text }) => (
          <div key={key} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${text}`} />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900">
              {loading ? <span className="text-slate-200 animate-pulse">—</span> : String(stats?.[key as keyof DashboardStats] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ href, label, icon: Icon, desc, color }) => (
            <a key={href} href={href}
              className={`${color} rounded-2xl p-5 text-white group flex flex-col gap-3 shadow-sm hover:shadow-md`}>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-white/70 mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 mt-auto self-end" />
            </a>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {!loading && stats?.total_jobs === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to start your search?</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
            Add your first job URL and let AI evaluate it against your profile in seconds.
          </p>
          <a href="/jobs"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm">
            <Search className="w-4 h-4" /> Discover Jobs
          </a>
        </div>
      )}
    </div>
  );
}

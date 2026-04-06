"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, MapPin, ExternalLink, Loader2, ChevronDown } from "lucide-react";
import type { ApplicationStatus } from "@/types";

const STATUSES: ApplicationStatus[] = ["evaluated","applied","responded","interview","offer","rejected","discarded","skip"];

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  evaluated: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
  applied:   { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400" },
  responded: { bg: "bg-cyan-50",   text: "text-cyan-700",   dot: "bg-cyan-400" },
  interview: { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400" },
  offer:     { bg: "bg-emerald-50",text: "text-emerald-700",dot: "bg-emerald-400" },
  rejected:  { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400" },
  discarded: { bg: "bg-slate-50",  text: "text-slate-500",  dot: "bg-slate-300" },
  skip:      { bg: "bg-slate-50",  text: "text-slate-400",  dot: "bg-slate-200" },
};

const pipelineCols: ApplicationStatus[] = ["evaluated","applied","interview","offer"];

interface AppRow {
  id: number; job_id: number; status: ApplicationStatus;
  title: string; company: string; url: string; remote: string; location: string;
  score: number; grade: string; archetype: string; summary: string;
  applied_at: string; notes: string; updated_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const s = statusStyle[status] ?? { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-300" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export function ApplicationsContent() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = () => {
    fetch("/api/applications").then(r => r.json()).then(d => { if (d.success) setApps(d.data); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: ApplicationStatus) => {
    const res = await fetch("/api/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    const d = await res.json();
    if (d.success) {
      toast.success(`Moved to ${status}`);
      if (status === "applied") toast.info("Follow-up emails scheduled for day 7, 14, 21");
      setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } else toast.error(d.error ?? "Update failed");
  };

  const grouped = STATUSES.reduce((acc, s) => { acc[s] = apps.filter(a => a.status === s); return acc; }, {} as Record<string, AppRow[]>);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <Tabs defaultValue="pipeline">
      <TabsList className="mb-6 bg-white border border-slate-200 shadow-sm p-1 rounded-xl">
        <TabsTrigger value="pipeline" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Pipeline</TabsTrigger>
        <TabsTrigger value="table" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm">All Applications</TabsTrigger>
      </TabsList>

      {/* Pipeline */}
      <TabsContent value="pipeline">
        {apps.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
            <p className="text-slate-400">No applications yet. Evaluate a job first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineCols.map((status) => {
              const s = statusStyle[status];
              const items = grouped[status] ?? [];
              return (
                <div key={status} className="space-y-3">
                  <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${s.bg}`}>
                    <span className={`text-sm font-bold ${s.text} flex items-center gap-1.5`}>
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />{status}
                    </span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-lg bg-white ${s.text}`}>{items.length}</span>
                  </div>
                  {items.map(app => (
                    <div key={app.id} onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                      className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 cursor-pointer hover:border-indigo-100 hover:shadow-md transition-all">
                      <p className="font-semibold text-sm text-slate-900 leading-snug mb-1">{app.title ?? "Untitled"}</p>
                      <p className="text-sm text-slate-400 flex items-center gap-1"><Building2 className="w-3 h-3" />{app.company}</p>
                      {app.grade && (
                        <span className="inline-block mt-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                          {app.grade} · {app.score}/10
                        </span>
                      )}
                      {expanded === app.id && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                          {app.summary && <p className="text-xs text-slate-500 leading-relaxed">{app.summary}</p>}
                          <Select value={app.status} onValueChange={(v) => v && updateStatus(app.id, v as ApplicationStatus)}>
                            <SelectTrigger className="h-8 text-sm rounded-lg border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map(s => <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <a href={app.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                            <ExternalLink className="w-3 h-3" />View job posting
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-slate-100 py-6 text-center">
                      <p className="text-xs text-slate-300">Empty</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* Table */}
      <TabsContent value="table">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {apps.length === 0 ? (
            <div className="py-16 text-center"><p className="text-slate-400">No applications yet.</p></div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Company</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Score</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {apps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-sm text-slate-900">{app.title ?? "Untitled"}</p>
                      {app.archetype && <p className="text-xs text-indigo-400 mt-0.5">{app.archetype}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-600 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-300" />{app.company}</p>
                      {app.location && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{app.location}</p>}
                    </td>
                    <td className="px-5 py-4">
                      {app.grade
                        ? <span className="inline-flex items-center text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{app.grade} · {app.score}/10</span>
                        : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <Select value={app.status} onValueChange={(v) => v && updateStatus(app.id, v as ApplicationStatus)}>
                        <SelectTrigger className="h-9 w-36 text-sm rounded-xl border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-4">
                      <a href={app.url} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors inline-flex">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

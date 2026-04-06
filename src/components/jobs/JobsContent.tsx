"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Sparkles, ExternalLink, Building2, MapPin, Wifi, Loader2 } from "lucide-react";

interface JobRow {
  id: number; title: string; company: string; location: string;
  remote: string; url: string; discovered_at: string;
  score?: number; grade?: string; archetype?: string; status?: string;
}

const gradeColor: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-700 border-emerald-200",
  B: "bg-blue-100 text-blue-700 border-blue-200",
  C: "bg-amber-100 text-amber-700 border-amber-200",
  D: "bg-orange-100 text-orange-700 border-orange-200",
  F: "bg-red-100 text-red-700 border-red-200",
};

const statusStyle: Record<string, string> = {
  evaluated: "bg-violet-100 text-violet-700",
  applied: "bg-blue-100 text-blue-700",
  responded: "bg-cyan-100 text-cyan-700",
  interview: "bg-amber-100 text-amber-700",
  offer: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  discarded: "bg-slate-100 text-slate-500",
};

export function JobsContent() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addUrl, setAddUrl] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addCompany, setAddCompany] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [evaluating, setEvaluating] = useState<number | null>(null);

  const load = () => {
    fetch("/api/jobs").then(r => r.json()).then(d => { if (d.success) setJobs(d.data); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const addJob = async () => {
    if (!addUrl) { toast.error("URL is required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: addUrl, title: addTitle || undefined, company: addCompany || undefined, description: addDesc || undefined, source: "manual" }) });
      const d = await res.json();
      if (d.success) { toast.success("Job added successfully"); setAddUrl(""); setAddTitle(""); setAddCompany(""); setAddDesc(""); load(); }
      else toast.error(d.error ?? "Failed to add job");
    } finally { setAdding(false); }
  };

  const evaluate = async (job: JobRow) => {
    setEvaluating(job.id);
    try {
      const res = await fetch("/api/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ job_id: job.id }) });
      const d = await res.json();
      if (d.success) { toast.success(`Score: ${d.data.grade} (${d.data.score}/10)`); load(); }
      else toast.error(d.error ?? "Evaluation failed");
    } finally { setEvaluating(null); }
  };

  return (
    <Tabs defaultValue="list">
      <TabsList className="mb-6 bg-white border border-slate-200 shadow-sm p-1 rounded-xl">
        <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
          All Jobs ({jobs.length})
        </TabsTrigger>
        <TabsTrigger value="add" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
          + Add Job
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
            <p className="text-slate-400 text-sm">No jobs yet. Add your first job to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-indigo-100 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-2">
                      <h3 className="font-semibold text-slate-900 text-base">{job.title ?? "Untitled Role"}</h3>
                      {job.grade && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${gradeColor[job.grade[0]] ?? gradeColor.F}`}>
                          {job.grade} · {job.score}/10
                        </span>
                      )}
                      {job.status && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[job.status] ?? "bg-slate-100 text-slate-500"}`}>
                          {job.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                      {job.company && <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{job.company}</span>}
                      {job.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location}</span>}
                      {job.remote && job.remote !== "unknown" && <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5" />{job.remote}</span>}
                      {job.archetype && <span className="text-indigo-400 font-medium">{job.archetype}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={job.url} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {!job.grade && (
                      <button onClick={() => evaluate(job)} disabled={evaluating === job.id}
                        className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                        {evaluating === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {evaluating === job.id ? "Evaluating..." : "Evaluate"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="add">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Add a New Job</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Job URL *</label>
              <Input placeholder="https://jobs.lever.co/company/..." value={addUrl} onChange={(e) => setAddUrl(e.target.value)}
                className="border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Job Title</label>
              <Input placeholder="Senior Software Engineer" value={addTitle} onChange={(e) => setAddTitle(e.target.value)}
                className="border-slate-200 focus:border-indigo-400 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Company</label>
              <Input placeholder="Stripe" value={addCompany} onChange={(e) => setAddCompany(e.target.value)}
                className="border-slate-200 focus:border-indigo-400 rounded-xl" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Job Description <span className="text-slate-400 font-normal">— paste for AI evaluation</span>
              </label>
              <Textarea placeholder="Paste the full job description here..." className="min-h-36 text-sm border-slate-200 focus:border-indigo-400 rounded-xl resize-none"
                value={addDesc} onChange={(e) => setAddDesc(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button onClick={addJob} disabled={adding}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm disabled:opacity-60 transition-colors">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {adding ? "Adding..." : "Add Job"}
            </button>
            <p className="text-sm text-slate-400">After adding, click <strong className="text-slate-600">Evaluate</strong> to run the AI analysis</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

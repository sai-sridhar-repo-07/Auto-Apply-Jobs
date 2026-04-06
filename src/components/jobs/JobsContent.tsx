"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Sparkles, ExternalLink, Building2, MapPin, Wifi } from "lucide-react";

interface JobRow {
  id: number;
  title: string;
  company: string;
  location: string;
  remote: string;
  url: string;
  source: string;
  discovered_at: string;
  score?: number;
  grade?: string;
  archetype?: string;
  status?: string;
  application_id?: number;
}

const statusColors: Record<string, string> = {
  evaluated: "bg-purple-100 text-purple-700",
  applied: "bg-blue-100 text-blue-700",
  responded: "bg-cyan-100 text-cyan-700",
  interview: "bg-yellow-100 text-yellow-700",
  offer: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  discarded: "bg-gray-100 text-gray-500",
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
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => { if (d.success) setJobs(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const addJob = async () => {
    if (!addUrl) { toast.error("URL is required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: addUrl,
          title: addTitle || undefined,
          company: addCompany || undefined,
          description: addDesc || undefined,
          source: "manual",
        }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Job added");
        setAddUrl(""); setAddTitle(""); setAddCompany(""); setAddDesc("");
        load();
      } else {
        toast.error(d.error ?? "Failed to add job");
      }
    } finally {
      setAdding(false);
    }
  };

  const evaluate = async (job: JobRow) => {
    if (!job.id) return;
    setEvaluating(job.id);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: job.id }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`Evaluated: ${d.data.grade} (${d.data.score}/10)`);
        load();
      } else {
        toast.error(d.error ?? "Evaluation failed");
      }
    } finally {
      setEvaluating(null);
    }
  };

  return (
    <Tabs defaultValue="list">
      <TabsList className="mb-5">
        <TabsTrigger value="list">Job List ({jobs.length})</TabsTrigger>
        <TabsTrigger value="add">Add Job</TabsTrigger>
      </TabsList>

      {/* ── Job List ── */}
      <TabsContent value="list">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : jobs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No jobs yet. Add your first job above.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">{job.title ?? "Untitled"}</h3>
                        {job.grade && (
                          <Badge variant="outline" className="text-sm font-bold">
                            {job.grade} · {job.score}/10
                          </Badge>
                        )}
                        {job.status && (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[job.status] ?? "bg-muted text-muted-foreground"}`}>
                            {job.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
                        {job.company && (
                          <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                        )}
                        {job.remote && job.remote !== "unknown" && (
                          <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5" />{job.remote}</span>
                        )}
                        {job.archetype && (
                          <span className="text-purple-500 font-medium">{job.archetype}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={job.url} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded hover:bg-muted transition-colors">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                      {!job.grade && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-sm"
                          onClick={() => evaluate(job)}
                          disabled={evaluating === job.id}
                        >
                          <Sparkles className="w-4 h-4" />
                          {evaluating === job.id ? "Evaluating..." : "Evaluate"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* ── Add Job ── */}
      <TabsContent value="add">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a Job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Job URL *</label>
                <Input placeholder="https://jobs.lever.co/company/..." value={addUrl} onChange={(e) => setAddUrl(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Job Title</label>
                <Input placeholder="Senior Software Engineer" value={addTitle} onChange={(e) => setAddTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Company</label>
                <Input placeholder="Acme Corp" value={addCompany} onChange={(e) => setAddCompany(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Job Description <span className="text-muted-foreground font-normal">(paste for AI evaluation)</span>
                </label>
                <Textarea
                  placeholder="Paste the full job description here..."
                  className="min-h-36 text-sm"
                  value={addDesc}
                  onChange={(e) => setAddDesc(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={addJob} disabled={adding} className="gap-2">
              <Plus className="w-4 h-4" />
              {adding ? "Adding..." : "Add Job"}
            </Button>
            <p className="text-sm text-muted-foreground">
              After adding, click <strong>Evaluate</strong> to run the 6-block AI analysis against your profile.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

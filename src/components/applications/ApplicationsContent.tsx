"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, MapPin, ExternalLink } from "lucide-react";
import type { ApplicationStatus } from "@/types";

const STATUSES: ApplicationStatus[] = [
  "evaluated", "applied", "responded", "interview", "offer", "rejected", "discarded", "skip",
];

const statusColors: Record<string, string> = {
  evaluated: "bg-purple-100 text-purple-700 border-purple-200",
  applied: "bg-blue-100 text-blue-700 border-blue-200",
  responded: "bg-cyan-100 text-cyan-700 border-cyan-200",
  interview: "bg-yellow-100 text-yellow-700 border-yellow-200",
  offer: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  discarded: "bg-gray-100 text-gray-500 border-gray-200",
  skip: "bg-gray-100 text-gray-400 border-gray-200",
};

interface AppRow {
  id: number;
  job_id: number;
  status: ApplicationStatus;
  title: string;
  company: string;
  url: string;
  remote: string;
  location: string;
  score: number;
  grade: string;
  archetype: string;
  summary: string;
  applied_at: string;
  notes: string;
  updated_at: string;
}

export function ApplicationsContent() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = () => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => { if (d.success) setApps(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: ApplicationStatus) => {
    const res = await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success(`Status updated to ${status}`);
      if (status === "applied") toast.info("Follow-up reminders scheduled for day 7, 14, and 21");
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    } else {
      toast.error(d.error ?? "Failed to update");
    }
  };

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter((a) => a.status === s);
    return acc;
  }, {} as Record<string, AppRow[]>);

  return (
    <Tabs defaultValue="pipeline">
      <TabsList className="mb-5">
        <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        <TabsTrigger value="table">Table View</TabsTrigger>
      </TabsList>

      {/* ── Pipeline ── */}
      <TabsContent value="pipeline">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["evaluated", "applied", "interview", "offer"] as ApplicationStatus[]).map((status) => (
              <div key={status} className="space-y-3">
                <div className={`text-sm font-semibold px-3 py-1.5 rounded-full w-fit border ${statusColors[status]}`}>
                  {status} ({grouped[status]?.length ?? 0})
                </div>
                <div className="space-y-2">
                  {(grouped[status] ?? []).map((app) => (
                    <Card key={app.id} className="hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                      <CardContent className="p-4 space-y-2">
                        <div className="font-medium text-sm leading-snug">{app.title ?? "Untitled"}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />{app.company}
                        </div>
                        {app.grade && (
                          <Badge variant="outline" className="text-xs">{app.grade} · {app.score}/10</Badge>
                        )}
                        {expanded === app.id && (
                          <div className="mt-3 pt-3 border-t border-border space-y-3">
                            <p className="text-sm text-muted-foreground leading-relaxed">{app.summary}</p>
                            <Select value={app.status} onValueChange={(v) => v && updateStatus(app.id, v as ApplicationStatus)}>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUSES.map((s) => (
                                  <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <a href={app.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                              <ExternalLink className="w-3.5 h-3.5" /> View Job
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {(grouped[status] ?? []).length === 0 && (
                    <div className="text-sm text-muted-foreground px-1">Empty</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      {/* ── Table ── */}
      <TabsContent value="table">
        <div className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : apps.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                No applications yet. Evaluate a job to get started.
              </CardContent>
            </Card>
          ) : (
            apps.map((app) => (
              <Card key={app.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4 px-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-base truncate">{app.title ?? "Untitled"}</span>
                        {app.grade && <Badge variant="outline" className="text-sm">{app.grade} · {app.score}/10</Badge>}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{app.company}</span>
                        {app.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{app.location}</span>}
                        {app.archetype && <span className="text-purple-500 font-medium">{app.archetype}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Select value={app.status} onValueChange={(v) => v && updateStatus(app.id, v as ApplicationStatus)}>
                        <SelectTrigger className="h-9 text-sm w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <a href={app.url} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded hover:bg-muted transition-colors">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

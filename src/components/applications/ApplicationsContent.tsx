"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, MapPin, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
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
      <TabsList className="mb-4">
        <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        <TabsTrigger value="table">Table View</TabsTrigger>
      </TabsList>

      {/* ── Pipeline View ── */}
      <TabsContent value="pipeline">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["evaluated", "applied", "interview", "offer"] as ApplicationStatus[]).map((status) => (
              <div key={status} className="space-y-2">
                <div className={`text-xs font-semibold px-3 py-1.5 rounded-full w-fit ${statusColors[status]}`}>
                  {status} ({grouped[status]?.length ?? 0})
                </div>
                <div className="space-y-2">
                  {(grouped[status] ?? []).map((app) => (
                    <Card key={app.id} className="hover:shadow-sm transition-shadow cursor-pointer text-xs"
                      onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                      <CardContent className="p-3 space-y-1">
                        <div className="font-medium truncate">{app.title ?? "Untitled"}</div>
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" />{app.company}
                        </div>
                        {app.grade && (
                          <Badge variant="outline" className="text-[10px]">{app.grade} · {app.score}/10</Badge>
                        )}
                        {expanded === app.id && (
                          <div className="mt-2 pt-2 border-t border-border space-y-2">
                            <p className="text-muted-foreground leading-relaxed">{app.summary}</p>
                            <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v as ApplicationStatus)}>
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUSES.map((s) => (
                                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <a href={app.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline">
                              <ExternalLink className="w-3 h-3" /> View Job
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {(grouped[status] ?? []).length === 0 && (
                    <div className="text-xs text-muted-foreground px-1">Empty</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      {/* ── Table View ── */}
      <TabsContent value="table">
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : apps.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No applications yet. Evaluate a job to get started.
              </CardContent>
            </Card>
          ) : (
            apps.map((app) => (
              <Card key={app.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{app.title ?? "Untitled"}</span>
                        {app.grade && <Badge variant="outline" className="text-xs">{app.grade} · {app.score}/10</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{app.company}</span>
                        {app.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.location}</span>}
                        {app.archetype && <span className="text-purple-500">{app.archetype}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v as ApplicationStatus)}>
                        <SelectTrigger className="h-7 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <a href={app.url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded hover:bg-muted transition-colors">
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
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

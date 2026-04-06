"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Send, X, Clock, Building2 } from "lucide-react";

interface FollowupRow {
  id: number;
  day: number;
  status: string;
  draft: string | null;
  due_at: string;
  application_id: number;
  title: string;
  company: string;
  url: string;
}

const dayLabels: Record<number, string> = {
  7: "Week 1 — First check-in",
  14: "Week 2 — Second follow-up",
  21: "Week 3 — Final follow-up",
};

export function FollowupContent() {
  const [followups, setFollowups] = useState<FollowupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const load = () => {
    fetch("/api/followup")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setFollowups(d.data);
          const existingDrafts: Record<number, string> = {};
          for (const f of d.data) {
            if (f.draft) existingDrafts[f.id] = f.draft;
          }
          setDrafts(existingDrafts);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const generateDraft = async (id: number) => {
    setDrafting(id);
    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "draft" }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Draft generated");
        setDrafts((prev) => ({ ...prev, [id]: d.data.draft }));
        load();
      } else {
        toast.error(d.error ?? "Failed to generate draft");
      }
    } finally {
      setDrafting(null);
    }
  };

  const markSent = async (id: number) => {
    const res = await fetch("/api/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "mark_sent" }),
    });
    if ((await res.json()).success) {
      toast.success("Marked as sent");
      setFollowups((prev) => prev.map((f) => f.id === id ? { ...f, status: "sent" } : f));
    }
  };

  const skip = async (id: number) => {
    const res = await fetch("/api/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "skip" }),
    });
    if ((await res.json()).success) {
      toast.info("Skipped");
      setFollowups((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const pending = followups.filter((f) => f.status !== "sent" && f.status !== "skipped");

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-muted-foreground">Loading follow-ups...</p>
      ) : pending.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No follow-ups due. They appear automatically when you mark an application as <strong>applied</strong>.
            </p>
          </CardContent>
        </Card>
      ) : (
        pending.map((fu) => (
          <Card key={fu.id}>
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold">{fu.title}</CardTitle>
                  <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" />{fu.company}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />Due {new Date(fu.due_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm shrink-0 px-3 py-1">
                  Day {fu.day} · {dayLabels[fu.day]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-5">
              {drafts[fu.id] ? (
                <>
                  <Textarea
                    className="text-sm min-h-36 font-mono leading-relaxed"
                    value={drafts[fu.id]}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [fu.id]: e.target.value }))}
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" className="gap-2" onClick={() => markSent(fu.id)}>
                      <Send className="w-4 h-4" /> Mark as Sent
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => generateDraft(fu.id)}
                      disabled={drafting === fu.id}>
                      <Sparkles className="w-4 h-4" /> Regenerate
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-2 ml-auto text-muted-foreground"
                      onClick={() => skip(fu.id)}>
                      <X className="w-4 h-4" /> Skip
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" className="gap-2" onClick={() => generateDraft(fu.id)}
                    disabled={drafting === fu.id}>
                    <Sparkles className="w-4 h-4" />
                    {drafting === fu.id ? "Generating..." : "Generate Draft"}
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground"
                    onClick={() => skip(fu.id)}>
                    <X className="w-4 h-4" /> Skip
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

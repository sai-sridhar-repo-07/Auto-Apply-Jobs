"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, ChevronDown, ChevronUp, BookOpen, Loader2 } from "lucide-react";

interface Question { question: string; hint: string; }

const ROUNDS = ["phone screen", "technical", "behavioral", "system design", "final", "general"];

export function InterviewContent() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [round, setRound] = useState("general");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ questions: Question[]; briefing: string; company_brief: string } | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const generate = async () => {
    if (!company || !role) { toast.error("Company and role are required"); return; }
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: 0, company, role, round, session_type: "mock" }),
      });
      const d = await res.json();
      if (d.success) {
        setResult(d.data);
        toast.success("Interview prep ready");
      } else {
        toast.error(d.error ?? "Failed to generate");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Tabs defaultValue="new">
      <TabsList className="mb-5">
        <TabsTrigger value="new">New Session</TabsTrigger>
        <TabsTrigger value="guide">STAR Guide</TabsTrigger>
      </TabsList>

      {/* ── New Session ── */}
      <TabsContent value="new" className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate Interview Prep</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Company *</label>
                <Input placeholder="Stripe" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Role *</label>
                <Input placeholder="Senior Software Engineer" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Round</label>
                <Select value={round} onValueChange={(v) => v && setRound(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROUNDS.map((r) => <SelectItem key={r} value={r} className="text-sm">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={generate} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating..." : "Generate Mock Interview"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-4">
            {/* Company Brief */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Company Brief
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                  {result.company_brief}
                </div>
              </CardContent>
            </Card>

            {/* Briefing */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Round Briefing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.briefing}</p>
              </CardContent>
            </Card>

            {/* Questions */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold">Interview Questions ({result.questions.length})</h3>
              {result.questions.map((q, i) => (
                <Card key={i}>
                  <CardContent className="py-4 px-5">
                    <div className="flex items-start justify-between gap-4 cursor-pointer"
                      onClick={() => setExpanded(expanded === i ? null : i)}>
                      <div className="flex gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-6 shrink-0 pt-0.5">{i + 1}.</span>
                        <p className="text-base font-medium leading-relaxed">{q.question}</p>
                      </div>
                      {expanded === i
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                    </div>
                    {expanded === i && (
                      <div className="mt-4 pt-4 border-t border-border ml-9">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">What a strong answer covers:</p>
                        <p className="text-sm text-foreground leading-relaxed">{q.hint}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      {/* ── STAR Guide ── */}
      <TabsContent value="guide">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">STAR Method Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: "S — Situation", color: "bg-blue-100 text-blue-700", desc: "Set the scene. Give context. Keep it brief — 2-3 sentences max. Interviewers care about the challenge, not the backstory." },
              { label: "T — Task", color: "bg-purple-100 text-purple-700", desc: "What was YOUR responsibility? What were you specifically asked or expected to do? Make it clear you owned something." },
              { label: "A — Action", color: "bg-yellow-100 text-yellow-700", desc: "This is the meat. What did YOU specifically do? Use 'I', not 'we'. Walk through your thinking, your decisions, your approach." },
              { label: "R — Result", color: "bg-green-100 text-green-700", desc: "What happened? Quantify if possible. Time saved, money earned, error rate reduced, team size, user growth. Numbers matter." },
            ].map(({ label, color, desc }) => (
              <div key={label} className="flex gap-4">
                <span className={`text-sm font-bold px-3 py-1.5 rounded shrink-0 h-fit ${color}`}>{label}</span>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-2">Pro tips</p>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Prepare 5-7 versatile stories that can flex across question types</li>
                <li>Have a failure story ready — interviewers love honest reflection</li>
                <li>Practice out loud. Timing matters — aim for 2-3 minutes per story</li>
                <li>Adapt the same story to different questions by emphasizing different parts</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

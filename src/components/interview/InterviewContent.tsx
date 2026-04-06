"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, ChevronDown, ChevronUp, BookOpen, Loader2, Brain } from "lucide-react";

interface Question { question: string; hint: string; }

const ROUNDS = ["phone screen", "technical", "behavioral", "system design", "final", "general"];

const starSteps = [
  { label: "S", title: "Situation", color: "bg-blue-600", light: "bg-blue-50 border-blue-100", text: "text-blue-700", desc: "Set the scene. Give context. Keep it brief — 2-3 sentences max. Interviewers care about the challenge, not the backstory." },
  { label: "T", title: "Task", color: "bg-violet-600", light: "bg-violet-50 border-violet-100", text: "text-violet-700", desc: "What was YOUR responsibility? What were you specifically asked or expected to do? Make it clear you owned something." },
  { label: "A", title: "Action", color: "bg-amber-500", light: "bg-amber-50 border-amber-100", text: "text-amber-700", desc: "This is the meat. What did YOU specifically do? Use 'I', not 'we'. Walk through your thinking, your decisions, your approach." },
  { label: "R", title: "Result", color: "bg-emerald-600", light: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", desc: "What happened? Quantify if possible. Time saved, money earned, error rate reduced, team size, user growth. Numbers matter." },
];

export function InterviewContent() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [round, setRound] = useState("general");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ questions: Question[]; briefing: string; company_brief: string } | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"session" | "star">("session");

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
      if (d.success) { setResult(d.data); toast.success("Interview prep ready"); }
      else toast.error(d.error ?? "Failed to generate");
    } finally { setGenerating(false); }
  };

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(["session", "star"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "session" ? "Mock Session" : "STAR Guide"}
          </button>
        ))}
      </div>

      {activeTab === "session" && (
        <div className="space-y-5">
          {/* Config Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Brain className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Generate Interview Prep</h2>
                <p className="text-sm text-slate-500">Mock Q&amp;A tailored to the company, role, and round</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Company *</label>
                <Input placeholder="Stripe" value={company} onChange={(e) => setCompany(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Role *</label>
                <Input placeholder="Senior Software Engineer" value={role} onChange={(e) => setRole(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Round</label>
                <Select value={round} onValueChange={(v) => v && setRound(v)}>
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROUNDS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <button onClick={generate} disabled={generating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating..." : "Generate Mock Interview"}
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              {/* Company Brief */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-semibold text-slate-900">Company Brief</h3>
                </div>
                <div className="px-6 py-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {result.company_brief}
                </div>
              </div>

              {/* Round Briefing */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4">
                <h3 className="font-semibold text-slate-900 mb-2">Round Briefing</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{result.briefing}</p>
              </div>

              {/* Questions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 px-1">Questions ({result.questions.length})</h3>
                {result.questions.map((q, i) => (
                  <div key={`q-${i}`} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <button className="w-full flex items-start justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                      onClick={() => setExpanded(expanded === i ? null : i)}>
                      <div className="flex gap-3 items-start">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">{q.question}</p>
                      </div>
                      {expanded === i
                        ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
                    </button>
                    {expanded === i && (
                      <div className="px-6 pb-5 pt-0 ml-9">
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                          <p className="text-xs font-semibold text-indigo-600 mb-1.5 uppercase tracking-wide">What a strong answer covers</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{q.hint}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "star" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {starSteps.map(({ label, title, color, light, text, desc }) => (
              <div key={label} className={`bg-white rounded-2xl border shadow-sm p-5 ${light}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-8 h-8 rounded-lg ${color} text-white text-sm font-bold flex items-center justify-center`}>{label}</span>
                  <span className={`font-semibold ${text}`}>{title}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-sm font-semibold text-slate-900 mb-3">Pro tips</p>
            <ul className="space-y-2">
              {[
                "Prepare 5-7 versatile stories that can flex across question types",
                "Have a failure story ready — interviewers love honest reflection",
                "Practice out loud. Timing matters — aim for 2-3 minutes per story",
                "Adapt the same story to different questions by emphasizing different parts",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

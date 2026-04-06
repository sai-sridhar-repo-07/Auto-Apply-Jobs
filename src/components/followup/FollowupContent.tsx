"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Send, X, Clock, Building2, Loader2, Mail } from "lucide-react";

interface FollowupRow {
  id: number; day: number; status: string; draft: string | null;
  due_at: string; application_id: number; title: string; company: string;
}

const dayConfig: Record<number, { label: string; color: string; bg: string }> = {
  7:  { label: "Week 1 · First check-in",    color: "text-blue-600",   bg: "bg-blue-50" },
  14: { label: "Week 2 · Second follow-up",   color: "text-amber-600",  bg: "bg-amber-50" },
  21: { label: "Week 3 · Final follow-up",    color: "text-red-600",    bg: "bg-red-50" },
};

export function FollowupContent() {
  const [followups, setFollowups] = useState<FollowupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const load = () => {
    fetch("/api/followup").then(r => r.json()).then(d => {
      if (d.success) {
        setFollowups(d.data);
        const existing: Record<number, string> = {};
        for (const f of d.data) if (f.draft) existing[f.id] = f.draft;
        setDrafts(existing);
      }
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const generateDraft = async (id: number) => {
    setDrafting(id);
    try {
      const res = await fetch("/api/followup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "draft" }) });
      const d = await res.json();
      if (d.success) { toast.success("Draft generated"); setDrafts(prev => ({ ...prev, [id]: d.data.draft })); load(); }
      else toast.error(d.error ?? "Failed to generate");
    } finally { setDrafting(null); }
  };

  const markSent = async (id: number) => {
    const res = await fetch("/api/followup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "mark_sent" }) });
    if ((await res.json()).success) { toast.success("Marked as sent ✓"); setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: "sent" } : f)); }
  };

  const skip = async (id: number) => {
    const res = await fetch("/api/followup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "skip" }) });
    if ((await res.json()).success) { toast.info("Skipped"); setFollowups(prev => prev.filter(f => f.id !== id)); }
  };

  const pending = followups.filter(f => f.status !== "sent" && f.status !== "skipped");

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>;

  if (pending.length === 0) return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
        <Mail className="w-7 h-7 text-slate-300" />
      </div>
      <h3 className="font-semibold text-slate-600 mb-1">No follow-ups due</h3>
      <p className="text-sm text-slate-400 max-w-xs mx-auto">
        Follow-ups are auto-scheduled when you mark an application as <strong>applied</strong>.
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {pending.map((fu) => {
        const cfg = dayConfig[fu.day] ?? dayConfig[7];
        const hasDraft = !!drafts[fu.id];
        return (
          <div key={fu.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-slate-900">{fu.title}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                    Day {fu.day} · {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{fu.company}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Due {new Date(fu.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              {hasDraft ? (
                <>
                  <Textarea className="text-sm min-h-36 font-mono leading-relaxed border-slate-200 rounded-xl bg-slate-50 resize-none"
                    value={drafts[fu.id]} onChange={e => setDrafts(prev => ({ ...prev, [fu.id]: e.target.value }))} />
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => markSent(fu.id)}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors">
                      <Send className="w-4 h-4" /> Mark as Sent
                    </button>
                    <button onClick={() => generateDraft(fu.id)} disabled={drafting === fu.id}
                      className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                      {drafting === fu.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Regenerate
                    </button>
                    <button onClick={() => skip(fu.id)}
                      className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors ml-auto">
                      <X className="w-4 h-4" /> Skip
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => generateDraft(fu.id)} disabled={drafting === fu.id}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm disabled:opacity-60 transition-colors">
                    {drafting === fu.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {drafting === fu.id ? "Generating..." : "Generate Email Draft"}
                  </button>
                  <button onClick={() => skip(fu.id)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <X className="w-4 h-4" /> Skip
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

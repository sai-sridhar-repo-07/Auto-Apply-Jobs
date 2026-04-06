"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles, ChevronDown, ChevronUp, Loader2, TrendingUp, PlusCircle } from "lucide-react";

interface OfferRow {
  id: number; application_id: number; base_salary: number; bonus: number;
  equity: string; total_comp: number; currency: string;
  market_p25: number; market_p50: number; market_p75: number;
  counter_script: string; competing_script: string; decision: string;
  received_at: string; deadline_at: string; notes: string;
  title: string; company: string;
}

const decisionConfig: Record<string, { color: string; bg: string; dot: string }> = {
  pending:     { color: "text-amber-700",  bg: "bg-amber-50",  dot: "bg-amber-400" },
  negotiating: { color: "text-blue-700",   bg: "bg-blue-50",   dot: "bg-blue-500" },
  accepted:    { color: "text-emerald-700",bg: "bg-emerald-50",dot: "bg-emerald-500" },
  declined:    { color: "text-red-700",    bg: "bg-red-50",    dot: "bg-red-500" },
};

function fmt(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

function marketPosition(salary: number, p25: number, p75: number): number {
  if (p75 <= p25) return 50;
  return Math.min(100, Math.max(0, ((salary - p25) / (p75 - p25)) * 100));
}

export function NegotiateContent() {
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"offers" | "add">("offers");

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [base, setBase] = useState("");
  const [bonus, setBonus] = useState("");
  const [equity, setEquity] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    fetch("/api/negotiate").then(r => r.json()).then(d => { if (d.success) setOffers(d.data); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submitOffer = async () => {
    if (!company || !role || !base) { toast.error("Company, role, and base salary are required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/negotiate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: 0, company, role, base_salary: Number(base), bonus: bonus ? Number(bonus) : undefined, equity: equity || undefined, currency, deadline_at: deadline || undefined }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Offer logged + negotiation scripts generated");
        setCompany(""); setRole(""); setBase(""); setBonus(""); setEquity(""); setDeadline("");
        load(); setActiveTab("offers");
      } else toast.error(d.error ?? "Failed to log offer");
    } finally { setSubmitting(false); }
  };

  const updateDecision = async (id: number, decision: string) => {
    const res = await fetch("/api/negotiate", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, decision }) });
    if ((await res.json()).success) {
      toast.success(`Decision updated: ${decision}`);
      setOffers(prev => prev.map(o => o.id === id ? { ...o, decision } : o));
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setActiveTab("offers")}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "offers" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Offers ({offers.length})
        </button>
        <button onClick={() => setActiveTab("add")}
          className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "add" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <PlusCircle className="w-3.5 h-3.5" /> Log Offer
        </button>
      </div>

      {activeTab === "offers" && (
        loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="font-semibold text-slate-600 mb-1">No offers yet</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Log an offer to get AI-generated counter-offer and competing-offer scripts.
            </p>
            <button onClick={() => setActiveTab("add")}
              className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Log your first offer →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => {
              const pos = marketPosition(offer.base_salary, offer.market_p25, offer.market_p75);
              const cfg = decisionConfig[offer.decision] ?? decisionConfig.pending;
              return (
                <div key={offer.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{offer.title ?? offer.company}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{offer.company}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {offer.decision}
                        </span>
                        <button onClick={() => setExpanded(expanded === offer.id ? null : offer.id)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                          {expanded === offer.id
                            ? <ChevronUp className="w-4 h-4 text-slate-400" />
                            : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        { label: "Base", value: offer.base_salary ? fmt(offer.base_salary, offer.currency) : "—" },
                        { label: "Bonus", value: offer.bonus ? fmt(offer.bonus, offer.currency) : "—" },
                        { label: "Equity", value: offer.equity ?? "—" },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
                          <p className="text-sm font-bold text-slate-900 mt-1">{value}</p>
                        </div>
                      ))}
                    </div>

                    {offer.market_p25 && offer.market_p75 && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>P25 {fmt(offer.market_p25, offer.currency)}</span>
                          <span className="font-semibold text-slate-700">Market position: {Math.round(pos)}th percentile</span>
                          <span>P75 {fmt(offer.market_p75, offer.currency)}</span>
                        </div>
                        <Progress value={pos} className="h-2" />
                      </div>
                    )}
                  </div>

                  {expanded === offer.id && (
                    <div className="px-6 pb-5 pt-0 border-t border-slate-50 space-y-5 mt-2">
                      <div className="pt-5 space-y-4">
                        {offer.counter_script && (
                          <div>
                            <p className="text-sm font-semibold text-slate-800 mb-2">Counter-offer script</p>
                            <div className="bg-slate-50 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono text-slate-700 border border-slate-100">
                              {offer.counter_script}
                            </div>
                          </div>
                        )}
                        {offer.competing_script && (
                          <div>
                            <p className="text-sm font-semibold text-slate-800 mb-2">Competing offer leverage script</p>
                            <div className="bg-slate-50 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono text-slate-700 border border-slate-100">
                              {offer.competing_script}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">Update decision</p>
                          <Select value={offer.decision} onValueChange={(v) => v && updateDecision(offer.id, v)}>
                            <SelectTrigger className="w-44 rounded-xl border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["pending", "negotiating", "accepted", "declined"].map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {activeTab === "add" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-slate-900">Log a New Offer</h2>
            <p className="text-sm text-slate-500 mt-0.5">AI will generate counter-offer and competing-offer leverage scripts</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Company *", placeholder: "Stripe", value: company, set: setCompany },
              { label: "Role *", placeholder: "Senior Engineer", value: role, set: setRole },
            ].map(({ label, placeholder, value, set }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">{label}</label>
                <Input placeholder={placeholder} value={value} onChange={(e) => set(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600">Base Salary *</label>
              <Input type="number" placeholder="180000" value={base} onChange={(e) => setBase(e.target.value)}
                className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600">Bonus</label>
              <Input type="number" placeholder="20000" value={bonus} onChange={(e) => setBonus(e.target.value)}
                className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600">Equity</label>
              <Input placeholder="0.25% over 4 years" value={equity} onChange={(e) => setEquity(e.target.value)}
                className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600">Currency</label>
              <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["USD", "EUR", "GBP", "CAD", "AUD", "SGD", "INR"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600">Decision Deadline</label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
            </div>
          </div>
          <button onClick={submitOffer} disabled={submitting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {submitting ? "Generating scripts..." : "Log Offer + Generate Scripts"}
          </button>
        </div>
      )}
    </div>
  );
}

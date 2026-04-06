"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles, TrendingUp, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

interface OfferRow {
  id: number;
  application_id: number;
  base_salary: number;
  bonus: number;
  equity: string;
  total_comp: number;
  currency: string;
  market_p25: number;
  market_p50: number;
  market_p75: number;
  counter_script: string;
  competing_script: string;
  decision: string;
  received_at: string;
  deadline_at: string;
  notes: string;
  title: string;
  company: string;
}

const decisionColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  negotiating: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
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
  const [adding, setAdding] = useState(false);

  // Form state
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [base, setBase] = useState("");
  const [bonus, setBonus] = useState("");
  const [equity, setEquity] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    fetch("/api/negotiate")
      .then((r) => r.json())
      .then((d) => { if (d.success) setOffers(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submitOffer = async () => {
    if (!company || !role || !base) { toast.error("Company, role, and base salary are required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: 0,
          company, role,
          base_salary: Number(base),
          bonus: bonus ? Number(bonus) : undefined,
          equity: equity || undefined,
          currency,
          deadline_at: deadline || undefined,
        }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Offer logged + negotiation scripts generated");
        setCompany(""); setRole(""); setBase(""); setBonus(""); setEquity(""); setDeadline("");
        setAdding(false);
        load();
      } else {
        toast.error(d.error ?? "Failed to log offer");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateDecision = async (id: number, decision: string) => {
    const res = await fetch("/api/negotiate", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    if ((await res.json()).success) {
      toast.success(`Decision updated to ${decision}`);
      setOffers((prev) => prev.map((o) => o.id === id ? { ...o, decision } : o));
    }
  };

  return (
    <Tabs defaultValue="offers">
      <TabsList className="mb-4">
        <TabsTrigger value="offers">Offers ({offers.length})</TabsTrigger>
        <TabsTrigger value="add">Log Offer</TabsTrigger>
      </TabsList>

      {/* ── Offers list ── */}
      <TabsContent value="offers">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : offers.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center">
              <p className="text-sm text-muted-foreground">No offers logged yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Switch to the <strong>Log Offer</strong> tab to add one.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => {
              const pos = marketPosition(offer.base_salary, offer.market_p25, offer.market_p75);
              return (
                <Card key={offer.id}>
                  <CardContent className="py-4 px-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-sm">{offer.title ?? "Role"}</h3>
                        <p className="text-xs text-muted-foreground">{offer.company}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${decisionColors[offer.decision] ?? ""}`}>
                          {offer.decision}
                        </span>
                        <button onClick={() => setExpanded(expanded === offer.id ? null : offer.id)}>
                          {expanded === offer.id
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>

                    {/* Comp Summary */}
                    <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: "Base", value: offer.base_salary ? fmt(offer.base_salary, offer.currency) : "—" },
                        { label: "Bonus", value: offer.bonus ? fmt(offer.bonus, offer.currency) : "—" },
                        { label: "Equity", value: offer.equity ?? "—" },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-muted rounded-md p-2">
                          <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                          <p className="text-sm font-semibold mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Market position bar */}
                    {offer.market_p25 && offer.market_p75 && (
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>P25 {fmt(offer.market_p25, offer.currency)}</span>
                          <span className="font-medium text-foreground">Market position: {Math.round(pos)}th pct</span>
                          <span>P75 {fmt(offer.market_p75, offer.currency)}</span>
                        </div>
                        <Progress value={pos} className="h-1.5" />
                      </div>
                    )}

                    {/* Expanded: scripts */}
                    {expanded === offer.id && (
                      <div className="mt-4 pt-4 border-t border-border space-y-4">
                        {offer.counter_script && (
                          <div>
                            <p className="text-xs font-semibold mb-1.5">Counter-offer script</p>
                            <div className="bg-muted rounded-md p-3 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                              {offer.counter_script}
                            </div>
                          </div>
                        )}
                        {offer.competing_script && (
                          <div>
                            <p className="text-xs font-semibold mb-1.5">Competing offer leverage script</p>
                            <div className="bg-muted rounded-md p-3 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                              {offer.competing_script}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium mb-1.5">Update decision</p>
                          <Select value={offer.decision} onValueChange={(v) => v && updateDecision(offer.id, v)}>
                            <SelectTrigger className="w-40 h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["pending", "negotiating", "accepted", "declined"].map((d) => (
                                <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* ── Log Offer ── */}
      <TabsContent value="add">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Log a New Offer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Company *</label>
                <Input placeholder="Stripe" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role *</label>
                <Input placeholder="Senior Engineer" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Base Salary *</label>
                <Input type="number" placeholder="180000" value={base} onChange={(e) => setBase(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Bonus</label>
                <Input type="number" placeholder="20000" value={bonus} onChange={(e) => setBonus(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Equity</label>
                <Input placeholder="0.25% over 4 years" value={equity} onChange={(e) => setEquity(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Currency</label>
                <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["USD", "EUR", "GBP", "CAD", "AUD", "SGD", "INR"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Decision Deadline</label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
            </div>
            <Button onClick={submitOffer} disabled={submitting} className="gap-1.5">
              <Sparkles className="w-4 h-4" />
              {submitting ? "Generating scripts..." : "Log Offer + Generate Scripts"}
            </Button>
            <p className="text-xs text-muted-foreground">
              AI will generate a counter-offer script and a competing-offer leverage script based on market data.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

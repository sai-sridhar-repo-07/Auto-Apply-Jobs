"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles, Copy, Check, FileText, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import type { FieldAnswer } from "@/lib/ai/apply";

const confidenceStyles = {
  high: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-red-100 text-red-700 border-red-200",
};

const typeIcon: Record<string, string> = {
  text: "T", email: "@", phone: "☎", textarea: "¶",
  select: "▾", radio: "◎", checkbox: "☑", file: "📎", url: "🔗", unknown: "?",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-2 rounded hover:bg-muted transition-colors shrink-0" title="Copy">
      {copied
        ? <Check className="w-4 h-4 text-green-500" />
        : <Copy className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}

export function ApplyContent() {
  const [url, setUrl] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"scraping" | "generating" | null>(null);
  const [answers, setAnswers] = useState<FieldAnswer[]>([]);
  const [meta, setMeta] = useState<{ company: string; role: string; fields_found: number } | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editedAnswers, setEditedAnswers] = useState<Record<string, string>>({});

  const [clCompany, setClCompany] = useState("");
  const [clRole, setClRole] = useState("");
  const [clDesc, setClDesc] = useState("");
  const [clLoading, setClLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const analyze = async () => {
    if (!url) { toast.error("Job application URL is required"); return; }
    setLoading(true);
    setAnswers([]);
    setMeta(null);
    setScreenshot(null);
    try {
      setStep("scraping");
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, company: company || undefined, role: role || undefined, job_description: jobDesc || undefined }),
      });
      setStep("generating");
      const d = await res.json();
      if (d.success) {
        setAnswers(d.data.answers);
        setMeta({ company: d.data.company, role: d.data.role, fields_found: d.data.fields_found });
        setScreenshot(d.data.screenshot);
        setClCompany(d.data.company);
        setClRole(d.data.role);
        toast.success(`${d.data.fields_found} fields found, answers generated`);
      } else {
        toast.error(d.error ?? "Failed to analyze form");
      }
    } finally {
      setLoading(false);
      setStep(null);
    }
  };

  const generateCoverLetter = async () => {
    if (!clCompany || !clRole) { toast.error("Company and role are required"); return; }
    setClLoading(true);
    try {
      const res = await fetch("/api/apply", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: clCompany, role: clRole, job_description: clDesc }),
      });
      const d = await res.json();
      if (d.success) { setCoverLetter(d.data.cover_letter); toast.success("Cover letter generated"); }
      else toast.error(d.error ?? "Failed");
    } finally {
      setClLoading(false);
    }
  };

  const getAnswer = (fieldId: string, original: string) =>
    editedAnswers[fieldId] !== undefined ? editedAnswers[fieldId] : original;

  return (
    <Tabs defaultValue="assist">
      <TabsList className="mb-5">
        <TabsTrigger value="assist">Form Assist</TabsTrigger>
        <TabsTrigger value="coverletter">Cover Letter</TabsTrigger>
      </TabsList>

      {/* ── Form Assist ── */}
      <TabsContent value="assist" className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job Application URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Application page URL * <span className="font-normal">(the page with the actual form)</span>
              </label>
              <Input placeholder="https://boards.greenhouse.io/company/jobs/123456"
                value={url} onChange={(e) => setUrl(e.target.value)} className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Company (optional)</label>
                <Input placeholder="Stripe" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Role (optional)</label>
                <Input placeholder="Senior Engineer" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Job description <span className="font-normal">(paste for better answers)</span>
                </label>
                <Textarea placeholder="Paste the job description for more tailored answers..."
                  className="min-h-24 text-sm" value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
              </div>
            </div>
            <Button onClick={analyze} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading
                ? step === "scraping" ? "Loading form..." : "Generating answers..."
                : "Analyze & Generate Answers"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Playwright opens the URL, extracts every form field, then Claude generates answers from your profile.
            </p>
          </CardContent>
        </Card>

        {meta && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-base font-semibold">{meta.company}</span>
              <span className="text-muted-foreground">—</span>
              <span className="text-base">{meta.role}</span>
              <Badge variant="outline">{meta.fields_found} fields detected</Badge>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline ml-auto">
                Open application <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* How-to hint */}
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="py-3 px-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">How to use:</strong> Open the application in another tab →
                  find each field → click <Copy className="w-3.5 h-3.5 inline mx-0.5" /> to copy → paste it in → submit yourself.
                </p>
              </CardContent>
            </Card>

            {/* Screenshot */}
            {screenshot && (
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground select-none">Show page screenshot</summary>
                <img src={`data:image/png;base64,${screenshot}`} alt="Application page"
                  className="mt-3 rounded-lg border border-border w-full max-w-2xl" />
              </details>
            )}

            {/* Field answers */}
            <div className="space-y-3">
              {answers.map((fa) => {
                const answer = getAnswer(fa.field.id, fa.answer);
                const isLong = answer.length > 120 || fa.field.type === "textarea";

                return (
                  <Card key={fa.field.id}>
                    <CardContent className="py-4 px-5">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded shrink-0 mt-0.5 text-muted-foreground border border-border">
                          {typeIcon[fa.field.type] ?? "?"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-sm font-semibold">{fa.field.label}</span>
                            {fa.field.required && <span className="text-xs text-red-500 font-medium">required</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${confidenceStyles[fa.confidence]}`}>
                              {fa.confidence}
                            </span>
                          </div>
                          {fa.field.options && fa.field.options.length > 0 && (
                            <p className="text-xs text-muted-foreground mb-2">
                              Options: {fa.field.options.slice(0, 5).join(" · ")}{fa.field.options.length > 5 ? " ···" : ""}
                            </p>
                          )}
                          {fa.field.type === "file" ? (
                            <p className="text-sm text-muted-foreground italic">{answer}</p>
                          ) : isLong ? (
                            <Textarea value={answer}
                              onChange={(e) => setEditedAnswers((prev) => ({ ...prev, [fa.field.id]: e.target.value }))}
                              className="text-sm min-h-24 font-mono resize-y" />
                          ) : (
                            <Input value={answer}
                              onChange={(e) => setEditedAnswers((prev) => ({ ...prev, [fa.field.id]: e.target.value }))}
                              className="text-sm" />
                          )}
                          {fa.note && (
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{fa.note}
                            </p>
                          )}
                        </div>
                        {fa.field.type !== "file" && <CopyButton text={answer} />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {answers.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">No form fields detected.</p>
                    <p className="text-sm text-muted-foreground mt-1">Some pages require login or use dynamic forms. Try the direct application URL.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </TabsContent>

      {/* ── Cover Letter ── */}
      <TabsContent value="coverletter" className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate Cover Letter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Company *</label>
                <Input placeholder="Stripe" value={clCompany} onChange={(e) => setClCompany(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Role *</label>
                <Input placeholder="Senior Engineer" value={clRole} onChange={(e) => setClRole(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Job description (optional)</label>
                <Textarea placeholder="Paste job description for a more tailored letter..."
                  className="min-h-24 text-sm" value={clDesc} onChange={(e) => setClDesc(e.target.value)} />
              </div>
            </div>
            <Button onClick={generateCoverLetter} disabled={clLoading} className="gap-2">
              {clLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {clLoading ? "Generating..." : "Generate Cover Letter"}
            </Button>
          </CardContent>
        </Card>

        {coverLetter && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Cover Letter</CardTitle>
                <CopyButton text={coverLetter} />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-72 text-sm leading-relaxed" />
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

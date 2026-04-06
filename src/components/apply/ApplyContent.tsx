"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Sparkles, Copy, Check, ChevronDown, ChevronUp,
  FileText, AlertCircle, Loader2, ExternalLink
} from "lucide-react";
import type { FieldAnswer } from "@/lib/ai/apply";

const confidenceStyles = {
  high: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-red-100 text-red-700 border-red-200",
};

const typeIcon: Record<string, string> = {
  text: "T",
  email: "@",
  phone: "☎",
  textarea: "¶",
  select: "▾",
  radio: "◎",
  checkbox: "☑",
  file: "📎",
  url: "🔗",
  unknown: "?",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded hover:bg-muted transition-colors shrink-0"
      title="Copy to clipboard"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-green-500" />
        : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
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
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editedAnswers, setEditedAnswers] = useState<Record<string, string>>({});

  // Cover letter state
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
        body: JSON.stringify({
          url,
          company: company || undefined,
          role: role || undefined,
          job_description: jobDesc || undefined,
        }),
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
      if (d.success) {
        setCoverLetter(d.data.cover_letter);
        toast.success("Cover letter generated");
      } else {
        toast.error(d.error ?? "Failed to generate cover letter");
      }
    } finally {
      setClLoading(false);
    }
  };

  const getAnswer = (fieldId: string, original: string) =>
    editedAnswers[fieldId] !== undefined ? editedAnswers[fieldId] : original;

  return (
    <Tabs defaultValue="assist">
      <TabsList className="mb-4">
        <TabsTrigger value="assist">Form Assist</TabsTrigger>
        <TabsTrigger value="coverletter">Cover Letter</TabsTrigger>
      </TabsList>

      {/* ── Form Assist ── */}
      <TabsContent value="assist" className="space-y-4">
        {/* Input card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Job Application URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Application page URL * <span className="text-muted-foreground">(the page with the actual form)</span>
              </label>
              <Input
                placeholder="https://boards.greenhouse.io/company/jobs/123456"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Company (optional — auto-detected)</label>
                <Input placeholder="Stripe" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role (optional — auto-detected)</label>
                <Input placeholder="Senior Engineer" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Job description <span className="text-muted-foreground">(paste for better answers)</span>
                </label>
                <Textarea
                  placeholder="Paste the job description for more tailored answers..."
                  className="min-h-20 text-sm"
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={analyze} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading
                ? step === "scraping" ? "Loading form..." : "Generating answers..."
                : "Analyze & Generate Answers"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Playwright will open the URL, extract every form field, then Claude generates personalized answers from your profile.
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {meta && (
          <div className="space-y-3">
            {/* Summary bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{meta.company}</span>
                <span className="text-muted-foreground">—</span>
                <span className="text-sm">{meta.role}</span>
              </div>
              <Badge variant="outline" className="text-xs">{meta.fields_found} fields detected</Badge>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline ml-auto">
                Open application <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* How to use */}
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">How to use:</strong> Open the application in another tab →
                  find each field → click <Copy className="w-3 h-3 inline mx-0.5" /> to copy the answer → paste it in.
                  Edit answers inline if needed before copying.
                </p>
              </CardContent>
            </Card>

            {/* Screenshot */}
            {screenshot && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">Show page screenshot</summary>
                <img
                  src={`data:image/png;base64,${screenshot}`}
                  alt="Application page screenshot"
                  className="mt-2 rounded-md border border-border w-full max-w-2xl"
                />
              </details>
            )}

            {/* Field answers */}
            <div className="space-y-2">
              {answers.map((fa) => {
                const answer = getAnswer(fa.field.id, fa.answer);
                const isExpanded = expanded === fa.field.id;
                const isLong = answer.length > 120;

                return (
                  <Card key={fa.field.id} className="overflow-hidden">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        {/* Type badge */}
                        <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded shrink-0 mt-0.5 text-muted-foreground">
                          {typeIcon[fa.field.type] ?? "?"}
                        </span>

                        <div className="flex-1 min-w-0">
                          {/* Label row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold">{fa.field.label}</span>
                            {fa.field.required && (
                              <span className="text-[10px] text-red-500 font-medium">required</span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${confidenceStyles[fa.confidence]}`}>
                              {fa.confidence}
                            </span>
                          </div>

                          {/* Options hint for select/radio */}
                          {fa.field.options && fa.field.options.length > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Options: {fa.field.options.slice(0, 5).join(" · ")}{fa.field.options.length > 5 ? " ···" : ""}
                            </p>
                          )}

                          {/* Answer */}
                          {fa.field.type === "file" ? (
                            <p className="text-xs text-muted-foreground mt-1.5 italic">{answer}</p>
                          ) : fa.field.type === "textarea" || isLong ? (
                            <div className="mt-1.5">
                              <Textarea
                                value={answer}
                                onChange={(e) =>
                                  setEditedAnswers((prev) => ({ ...prev, [fa.field.id]: e.target.value }))
                                }
                                className="text-xs min-h-20 font-mono resize-y"
                                rows={isExpanded ? 8 : 3}
                              />
                            </div>
                          ) : (
                            <div className="mt-1.5">
                              <Input
                                value={answer}
                                onChange={(e) =>
                                  setEditedAnswers((prev) => ({ ...prev, [fa.field.id]: e.target.value }))
                                }
                                className="text-xs h-8 font-mono"
                              />
                            </div>
                          )}

                          {/* Note */}
                          {fa.note && (
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-start gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                              {fa.note}
                            </p>
                          )}
                        </div>

                        {/* Copy button */}
                        {fa.field.type !== "file" && <CopyButton text={answer} />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {answers.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No form fields were detected on this page.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Some pages require login or use dynamic forms. Try the direct application URL.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </TabsContent>

      {/* ── Cover Letter ── */}
      <TabsContent value="coverletter" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Generate Cover Letter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Company *</label>
                <Input placeholder="Stripe" value={clCompany} onChange={(e) => setClCompany(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role *</label>
                <Input placeholder="Senior Engineer" value={clRole} onChange={(e) => setClRole(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Job description (optional)</label>
                <Textarea
                  placeholder="Paste job description for a more tailored letter..."
                  className="min-h-20 text-sm"
                  value={clDesc}
                  onChange={(e) => setClDesc(e.target.value)}
                />
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
                <CardTitle className="text-sm">Cover Letter</CardTitle>
                <CopyButton text={coverLetter} />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-64 text-sm leading-relaxed"
              />
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

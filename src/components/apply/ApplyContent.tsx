"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Copy, Check, FileText, AlertCircle, Loader2, ExternalLink, Zap, ScrollText, Download } from "lucide-react";
import type { FieldAnswer } from "@/lib/ai/apply";

const confidenceConfig = {
  high:   { label: "high",   color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  medium: { label: "medium", color: "text-amber-700",   bg: "bg-amber-50",   dot: "bg-amber-400" },
  low:    { label: "low",    color: "text-red-700",     bg: "bg-red-50",     dot: "bg-red-400" },
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
    <button onClick={copy} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0" title="Copy">
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
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
  const [editedAnswers, setEditedAnswers] = useState<Record<string, string>>({});

  const [clCompany, setClCompany] = useState("");
  const [clRole, setClRole] = useState("");
  const [clDesc, setClDesc] = useState("");
  const [clLoading, setClLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const [rvCompany, setRvCompany] = useState("");
  const [rvRole, setRvRole] = useState("");
  const [rvDesc, setRvDesc] = useState("");
  const [rvLoading, setRvLoading] = useState(false);
  const [resume, setResume] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"assist" | "coverletter" | "resume">("assist");

  const analyze = async () => {
    if (!url) { toast.error("Job application URL is required"); return; }
    setLoading(true); setAnswers([]); setMeta(null); setScreenshot(null);
    try {
      setStep("scraping");
      const res = await fetch("/api/apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, company: company || undefined, role: role || undefined, job_description: jobDesc || undefined }),
      });
      setStep("generating");
      const d = await res.json();
      if (d.success) {
        setAnswers(d.data.answers);
        setMeta({ company: d.data.company, role: d.data.role, fields_found: d.data.fields_found });
        setScreenshot(d.data.screenshot);
        setClCompany(d.data.company); setClRole(d.data.role);
        toast.success(`${d.data.fields_found} fields found, answers generated`);
      } else toast.error(d.error ?? "Failed to analyze form");
    } finally { setLoading(false); setStep(null); }
  };

  const generateCoverLetter = async () => {
    if (!clCompany || !clRole) { toast.error("Company and role are required"); return; }
    setClLoading(true);
    try {
      const res = await fetch("/api/apply", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: clCompany, role: clRole, job_description: clDesc }),
      });
      const d = await res.json();
      if (d.success) { setCoverLetter(d.data.cover_letter); toast.success("Cover letter generated"); }
      else toast.error(d.error ?? "Failed");
    } finally { setClLoading(false); }
  };

  const getAnswer = (fieldId: string, original: string) =>
    editedAnswers[fieldId] !== undefined ? editedAnswers[fieldId] : original;

  const generateResume = async () => {
    if (!rvCompany || !rvRole) { toast.error("Company and role are required"); return; }
    setRvLoading(true);
    try {
      const res = await fetch("/api/apply", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: rvCompany, role: rvRole, job_description: rvDesc }),
      });
      const d = await res.json();
      if (d.success) { setResume(d.data.resume); toast.success("Tailored resume generated"); }
      else toast.error(d.error ?? "Failed");
    } finally { setRvLoading(false); }
  };

  const downloadPdf = async () => {
    if (!resume) return;
    setPdfLoading(true);
    try {
      const filename = `resume-${rvRole}-${rvCompany}`.toLowerCase().replace(/\s+/g, "-");
      const res = await fetch("/api/resume-pdf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: resume, filename }),
      });
      if (!res.ok) { toast.error("Failed to generate PDF"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } finally { setPdfLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(["assist", "coverletter", "resume"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "assist" ? "Form Assist" : t === "coverletter" ? "Cover Letter" : "Resume"}
          </button>
        ))}
      </div>

      {activeTab === "assist" && (
        <div className="space-y-5">
          {/* Input Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Apply Assist</h2>
                <p className="text-sm text-slate-500">Paste the application URL — AI fills every form field from your profile</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600">
                Application page URL * <span className="text-slate-400 font-normal">(the page with the actual form)</span>
              </label>
              <Input placeholder="https://boards.greenhouse.io/company/jobs/123456"
                value={url} onChange={(e) => setUrl(e.target.value)}
                className="font-mono rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Company <span className="text-slate-400 font-normal">(optional)</span></label>
                <Input placeholder="Stripe" value={company} onChange={(e) => setCompany(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Role <span className="text-slate-400 font-normal">(optional)</span></label>
                <Input placeholder="Senior Engineer" value={role} onChange={(e) => setRole(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-slate-600">
                  Job description <span className="text-slate-400 font-normal">(paste for better answers)</span>
                </label>
                <Textarea placeholder="Paste the job description for more tailored answers..."
                  className="min-h-24 text-sm rounded-xl border-slate-200 bg-slate-50 focus:bg-white resize-none"
                  value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={analyze} disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? (step === "scraping" ? "Loading form..." : "Generating answers...") : "Analyze & Generate Answers"}
              </button>
              <p className="text-xs text-slate-400">Playwright opens the URL, extracts every form field, then Claude generates answers</p>
            </div>
          </div>

          {meta && (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex items-center gap-4 flex-wrap">
                <div>
                  <span className="font-semibold text-slate-900">{meta.company}</span>
                  <span className="text-slate-400 mx-2">—</span>
                  <span className="text-slate-700">{meta.role}</span>
                </div>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                  {meta.fields_found} fields detected
                </span>
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 ml-auto transition-colors">
                  Open application <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* How-to */}
              <div className="bg-indigo-50 rounded-2xl border border-indigo-100 px-5 py-3">
                <p className="text-sm text-indigo-700 leading-relaxed">
                  <strong>How to use:</strong> Open the application in another tab → find each field → click the copy icon → paste and submit.
                </p>
              </div>

              {/* Screenshot */}
              {screenshot && (
                <details className="text-sm text-slate-500">
                  <summary className="cursor-pointer hover:text-slate-700 select-none font-medium">Show page screenshot</summary>
                  <img src={`data:image/png;base64,${screenshot}`} alt="Application page"
                    className="mt-3 rounded-xl border border-slate-200 w-full max-w-2xl" />
                </details>
              )}

              {/* Field answers */}
              <div className="space-y-3">
                {answers.length === 0 ? (
                  <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
                    <p className="text-slate-500 font-medium">No form fields detected.</p>
                    <p className="text-sm text-slate-400 mt-1">Some pages require login or use dynamic forms. Try the direct application URL.</p>
                  </div>
                ) : answers.map((fa) => {
                  const answer = getAnswer(fa.field.id, fa.answer);
                  const isLong = answer.length > 120 || fa.field.type === "textarea";
                  const conf = confidenceConfig[fa.confidence] ?? confidenceConfig.medium;
                  return (
                    <div key={fa.field.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-lg shrink-0 mt-0.5 border border-slate-200">
                          {typeIcon[fa.field.type] ?? "?"}
                        </span>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900">{fa.field.label}</span>
                            {fa.field.required && <span className="text-xs text-red-500 font-medium">required</span>}
                            <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${conf.bg} ${conf.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                              {conf.label}
                            </span>
                          </div>
                          {fa.field.options && fa.field.options.length > 0 && (
                            <p className="text-xs text-slate-400">
                              Options: {fa.field.options.slice(0, 5).join(" · ")}{fa.field.options.length > 5 ? " ···" : ""}
                            </p>
                          )}
                          {fa.field.type === "file" ? (
                            <p className="text-sm text-slate-500 italic">{answer}</p>
                          ) : isLong ? (
                            <Textarea value={answer}
                              onChange={(e) => setEditedAnswers(prev => ({ ...prev, [fa.field.id]: e.target.value }))}
                              className="text-sm min-h-24 font-mono resize-y rounded-xl border-slate-200 bg-slate-50" />
                          ) : (
                            <Input value={answer}
                              onChange={(e) => setEditedAnswers(prev => ({ ...prev, [fa.field.id]: e.target.value }))}
                              className="text-sm rounded-xl border-slate-200 bg-slate-50" />
                          )}
                          {fa.note && (
                            <p className="text-xs text-slate-400 flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{fa.note}
                            </p>
                          )}
                        </div>
                        {fa.field.type !== "file" && <CopyButton text={answer} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "coverletter" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Generate Cover Letter</h2>
                <p className="text-sm text-slate-500 mt-0.5">AI-crafted letter from your profile + job details</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Company *</label>
                <Input placeholder="Stripe" value={clCompany} onChange={(e) => setClCompany(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Role *</label>
                <Input placeholder="Senior Engineer" value={clRole} onChange={(e) => setClRole(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Job description <span className="text-slate-400 font-normal">(optional)</span></label>
                <Textarea placeholder="Paste job description for a more tailored letter..."
                  className="min-h-24 text-sm rounded-xl border-slate-200 bg-slate-50 focus:bg-white resize-none"
                  value={clDesc} onChange={(e) => setClDesc(e.target.value)} />
              </div>
            </div>
            <button onClick={generateCoverLetter} disabled={clLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors">
              {clLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {clLoading ? "Generating..." : "Generate Cover Letter"}
            </button>
          </div>

          {coverLetter && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                <h3 className="font-semibold text-slate-900">Cover Letter</h3>
                <CopyButton text={coverLetter} />
              </div>
              <div className="px-6 py-4">
                <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                  className="min-h-72 text-sm leading-relaxed font-mono rounded-xl border-slate-200 bg-slate-50 resize-y" />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "resume" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ScrollText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Tailored Resume</h2>
                <p className="text-sm text-slate-500 mt-0.5">AI rewrites and reorders your resume to match this specific job</p>
              </div>
            </div>

            {/* What it does */}
            <div className="bg-emerald-50 rounded-xl border border-emerald-100 px-5 py-3 space-y-1">
              <p className="text-sm font-semibold text-emerald-800">What the AI does:</p>
              <ul className="space-y-1">
                {[
                  "Reorders experience bullets to put the most relevant ones first",
                  "Rewrites your summary to speak directly to this role",
                  "Mirrors the job's keywords naturally (no stuffing)",
                  "Groups and prioritizes skills by what this job needs most",
                  "Explains exactly what it changed and why",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />{t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Company *</label>
                <Input placeholder="Stripe" value={rvCompany} onChange={(e) => setRvCompany(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Role *</label>
                <Input placeholder="Senior ML Engineer" value={rvRole} onChange={(e) => setRvRole(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-slate-600">
                  Job description * <span className="text-slate-400 font-normal">(paste for best results)</span>
                </label>
                <Textarea placeholder="Paste the full job description here..."
                  className="min-h-32 text-sm rounded-xl border-slate-200 bg-slate-50 focus:bg-white resize-none"
                  value={rvDesc} onChange={(e) => setRvDesc(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={generateResume} disabled={rvLoading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors">
                {rvLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {rvLoading ? "Tailoring resume..." : "Generate Tailored Resume"}
              </button>
              <p className="text-xs text-slate-400">Reads your profile.yml + cv.md to build the output</p>
            </div>
          </div>

          {resume && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                <div>
                  <h3 className="font-semibold text-slate-900">Tailored Resume</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Edit below if needed, then download as PDF</p>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton text={resume} />
                  <button onClick={downloadPdf} disabled={pdfLoading}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                    {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    {pdfLoading ? "Generating PDF..." : "Download PDF"}
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                <Textarea value={resume} onChange={(e) => setResume(e.target.value)}
                  className="min-h-[480px] text-sm leading-relaxed font-mono rounded-xl border-slate-200 bg-slate-50 resize-y" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

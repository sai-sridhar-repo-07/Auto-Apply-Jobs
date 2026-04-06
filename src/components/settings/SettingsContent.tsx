"use client";

import { FileText, Key, Database, CheckCircle2 } from "lucide-react";

const setupItems = [
  {
    label: "Anthropic API Key",
    desc: "Set ANTHROPIC_API_KEY in your .env.local file",
    icon: Key,
    path: ".env.local",
    color: "bg-violet-50 border-violet-100",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    label: "Profile Config",
    desc: "Copy config/profile.example.yml → config/profile.yml and fill in your details",
    icon: FileText,
    path: "config/profile.yml",
    color: "bg-blue-50 border-blue-100",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    label: "Portals Config",
    desc: "Copy config/portals.example.yml → config/portals.yml and add target companies",
    icon: Database,
    path: "config/portals.yml",
    color: "bg-emerald-50 border-emerald-100",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
];

const profileFields = [
  { field: "target_roles", desc: "Job titles you're targeting — used to match and score jobs." },
  { field: "archetypes", desc: "Role lenses for evaluation. Each gets equal weight. Customize to your goals." },
  { field: "proof_points", desc: "Quantified achievements pulled into CV suggestions and interview prep." },
  { field: "superpowers", desc: "What you're unusually good at — used in cover letters and positioning." },
  { field: "comp_min / comp_max", desc: "Salary range used in compensation research and offer scoring." },
];

const howItWorks = [
  { step: "1", label: "Discover", desc: "Add job URLs manually or paste job descriptions in the Discover Jobs tab", color: "bg-indigo-600" },
  { step: "2", label: "Evaluate", desc: "Click Evaluate to run a 6-block AI analysis: gap analysis, seniority, comp research, CV suggestions, and interview prep", color: "bg-violet-600" },
  { step: "3", label: "Apply Assist", desc: "Paste the application form URL — AI reads every field and generates personalized answers for copy-pasting", color: "bg-blue-600" },
  { step: "4", label: "Track", desc: "Move applications through the pipeline: evaluated → applied → interview → offer", color: "bg-sky-600" },
  { step: "5", label: "Follow up", desc: "When you mark a job as applied, follow-up reminders are scheduled for day 7, 14, and 21", color: "bg-teal-600" },
  { step: "6", label: "Prep", desc: "Use Interview Prep to generate mock Q&A sessions and company research briefs", color: "bg-emerald-600" },
  { step: "7", label: "Negotiate", desc: "Log offers to get AI-generated counter-offer and competing-offer scripts", color: "bg-amber-500" },
];

export function SettingsContent() {
  return (
    <div className="space-y-6">
      {/* Setup Checklist */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-900">Setup Checklist</h2>
          <p className="text-sm text-slate-500 mt-0.5">Complete these three steps to get started</p>
        </div>
        <div className="divide-y divide-slate-50">
          {setupItems.map(({ label, desc, icon: Icon, path, color, iconColor, iconBg }) => (
            <div key={label} className={`flex items-start gap-4 px-6 py-5`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{label}</p>
                <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                <code className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-lg mt-2 inline-block border border-slate-200">{path}</code>
              </div>
              <CheckCircle2 className="w-5 h-5 text-slate-200 shrink-0 mt-0.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Profile Guide */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-900">Profile Configuration Guide</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Your <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 text-xs">config/profile.yml</code> drives
            every AI evaluation, CV suggestion, and negotiation script.
          </p>
        </div>
        <div className="divide-y divide-slate-50">
          {profileFields.map(({ field, desc }) => (
            <div key={field} className="flex items-start gap-4 px-6 py-4">
              <code className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-lg border border-indigo-100 shrink-0 mt-0.5 whitespace-nowrap">{field}</code>
              <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-900">How AutoApply Works</h2>
          <p className="text-sm text-slate-500 mt-0.5">The full job search workflow from discovery to offer</p>
        </div>
        <div className="divide-y divide-slate-50">
          {howItWorks.map(({ step, label, desc, color }) => (
            <div key={step} className="flex items-start gap-4 px-6 py-4">
              <span className={`w-7 h-7 rounded-lg ${color} text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5`}>
                {step}
              </span>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{label}</p>
                <p className="text-sm text-slate-500 leading-relaxed mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

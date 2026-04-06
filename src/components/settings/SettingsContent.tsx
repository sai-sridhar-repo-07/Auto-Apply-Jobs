"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Key, Database } from "lucide-react";

export function SettingsContent() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Setup checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Setup Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              label: "Anthropic API Key",
              desc: "Set ANTHROPIC_API_KEY in your .env.local file",
              icon: Key,
              path: ".env.local",
            },
            {
              label: "Profile Config",
              desc: "Copy config/profile.example.yml → config/profile.yml and fill in your details",
              icon: FileText,
              path: "config/profile.yml",
            },
            {
              label: "Portals Config",
              desc: "Copy config/portals.example.yml → config/portals.yml and add target companies",
              icon: Database,
              path: "config/portals.yml",
            },
          ].map(({ label, desc, icon: Icon, path }) => (
            <div key={label} className="flex items-start gap-4 p-4 rounded-lg bg-muted">
              <Icon className="w-5 h-5 shrink-0 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                <code className="text-xs font-mono bg-background px-2 py-0.5 rounded mt-1.5 inline-block border border-border">{path}</code>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Profile guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Configuration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your <code className="font-mono bg-muted px-1.5 rounded border border-border">config/profile.yml</code> drives
            every AI evaluation, CV suggestion, and negotiation script.
          </p>
          <div className="space-y-3">
            {[
              { field: "target_roles", desc: "Job titles you're targeting — used to match and score jobs." },
              { field: "archetypes", desc: "Role lenses for evaluation. Each gets equal weight. Customize to your goals." },
              { field: "proof_points", desc: "Quantified achievements pulled into CV suggestions and interview prep." },
              { field: "superpowers", desc: "What you're unusually good at — used in cover letters and positioning." },
              { field: "comp_min / comp_max", desc: "Salary range used in compensation research and offer scoring." },
            ].map(({ field, desc }) => (
              <div key={field} className="flex gap-3 items-start">
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded border border-border h-fit shrink-0">{field}</code>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How AutoApply Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { step: "1", label: "Discover", desc: "Add job URLs manually or paste job descriptions in the Discover Jobs tab" },
            { step: "2", label: "Evaluate", desc: "Click Evaluate to run a 6-block AI analysis: gap analysis, seniority, comp research, CV suggestions, and interview prep" },
            { step: "3", label: "Apply Assist", desc: "Paste the application form URL — AI reads every field and generates personalized answers for copy-pasting" },
            { step: "4", label: "Track", desc: "Move applications through the pipeline: evaluated → applied → interview → offer" },
            { step: "5", label: "Follow up", desc: "When you mark a job as applied, follow-up reminders are scheduled for day 7, 14, and 21" },
            { step: "6", label: "Prep", desc: "Use Interview Prep to generate mock Q&A sessions and company research briefs" },
            { step: "7", label: "Negotiate", desc: "Log offers to get AI-generated counter-offer and competing-offer scripts" },
          ].map(({ step, label, desc }) => (
            <div key={step} className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {step}
              </span>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

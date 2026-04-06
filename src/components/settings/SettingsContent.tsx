"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, FileText, Key, Database } from "lucide-react";

export function SettingsContent() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Setup Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Setup Status</CardTitle>
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
            <div key={label} className="flex items-start gap-3 p-3 rounded-md bg-muted">
              <Icon className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                <code className="text-[11px] font-mono bg-background px-1.5 py-0.5 rounded mt-1 inline-block">{path}</code>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Profile Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Profile Configuration Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Your <code className="font-mono bg-muted px-1 rounded">config/profile.yml</code> is the brain of AutoApply.
            Every AI evaluation, CV suggestion, and negotiation script reads from it.
          </p>
          <div className="space-y-2">
            {[
              { field: "target_roles", desc: "Job titles you're targeting. Used to match and rank jobs." },
              { field: "archetypes", desc: "Role lenses for evaluation. Each gets equal weight. Customize to your goals." },
              { field: "proof_points", desc: "Quantified achievements. Pulled into CV suggestions and interview prep." },
              { field: "superpowers", desc: "What you're unusually good at. Used in cover letters and positioning." },
              { field: "comp_min / comp_max", desc: "Salary range. Used in comp research and offer scoring." },
            ].map(({ field, desc }) => (
              <div key={field} className="flex gap-3">
                <code className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded h-fit shrink-0">{field}</code>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How AutoApply Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {[
            { step: "1", label: "Discover", desc: "Add job URLs manually or paste job descriptions in the Discover Jobs tab" },
            { step: "2", label: "Evaluate", desc: "Click Evaluate to run a 6-block AI analysis: gap analysis, seniority, comp research, CV suggestions, and interview prep" },
            { step: "3", label: "Track", desc: "Move applications through the pipeline: evaluated → applied → interview → offer" },
            { step: "4", label: "Follow up", desc: "When you mark a job as applied, follow-up reminders are scheduled for day 7, 14, and 21" },
            { step: "5", label: "Prep", desc: "Use Interview Prep to generate mock Q&A sessions and company research briefs" },
            { step: "6", label: "Negotiate", desc: "Log offers to get AI-generated counter-offer and competing-offer scripts" },
          ].map(({ step, label, desc }) => (
            <div key={step} className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {step}
              </span>
              <div>
                <p className="font-medium text-xs">{label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

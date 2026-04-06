import { InterviewContent } from "@/components/interview/InterviewContent";

export default function InterviewPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Interview Prep</h1>
        <p className="text-slate-500 mt-1">Mock Q&A sessions, company research briefs, and STAR story coaching</p>
      </div>
      <InterviewContent />
    </div>
  );
}

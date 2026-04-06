import { InterviewContent } from "@/components/interview/InterviewContent";

export default function InterviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Interview Prep</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI mock Q&amp;A sessions, STAR stories, and company research briefs
        </p>
      </div>
      <InterviewContent />
    </div>
  );
}

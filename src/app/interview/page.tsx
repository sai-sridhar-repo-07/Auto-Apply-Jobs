import { InterviewContent } from "@/components/interview/InterviewContent";

export default function InterviewPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1>Interview Prep</h1>
        <p className="text-muted-foreground mt-1">
          AI mock Q&amp;A sessions, STAR stories, and company research briefs
        </p>
      </div>
      <InterviewContent />
    </div>
  );
}

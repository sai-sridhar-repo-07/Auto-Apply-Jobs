import { JobsContent } from "@/components/jobs/JobsContent";

export default function JobsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1>Discover Jobs</h1>
        <p className="text-muted-foreground mt-1">Add job URLs, evaluate with AI, or scan company portals</p>
      </div>
      <JobsContent />
    </div>
  );
}

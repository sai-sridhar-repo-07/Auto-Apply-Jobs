import { JobsContent } from "@/components/jobs/JobsContent";

export default function JobsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Discover Jobs</h1>
        <p className="text-muted-foreground text-sm mt-1">Add job URLs, evaluate with AI, or scan company portals</p>
      </div>
      <JobsContent />
    </div>
  );
}

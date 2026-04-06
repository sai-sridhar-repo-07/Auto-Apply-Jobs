import { JobsContent } from "@/components/jobs/JobsContent";

export default function JobsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Discover Jobs</h1>
        <p className="text-slate-500 mt-1">Add job URLs, paste descriptions, and get instant AI evaluations</p>
      </div>
      <JobsContent />
    </div>
  );
}

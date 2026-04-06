import { ApplicationsContent } from "@/components/applications/ApplicationsContent";

export default function ApplicationsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
        <p className="text-slate-500 mt-1">Track every application from evaluation to offer</p>
      </div>
      <ApplicationsContent />
    </div>
  );
}

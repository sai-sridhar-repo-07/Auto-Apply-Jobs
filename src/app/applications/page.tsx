import { ApplicationsContent } from "@/components/applications/ApplicationsContent";

export default function ApplicationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your application pipeline</p>
      </div>
      <ApplicationsContent />
    </div>
  );
}

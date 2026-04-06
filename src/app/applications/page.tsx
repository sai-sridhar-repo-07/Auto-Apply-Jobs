import { ApplicationsContent } from "@/components/applications/ApplicationsContent";

export default function ApplicationsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1>Applications</h1>
        <p className="text-muted-foreground mt-1">Track your application pipeline</p>
      </div>
      <ApplicationsContent />
    </div>
  );
}

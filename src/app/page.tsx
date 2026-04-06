import { Suspense } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your job search at a glance</p>
      </div>
      <Suspense fallback={<p className="text-muted-foreground">Loading stats...</p>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

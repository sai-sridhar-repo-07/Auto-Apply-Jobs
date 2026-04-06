import { Suspense } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your job search at a glance</p>
      </div>
      <Suspense fallback={<div className="text-muted-foreground text-sm">Loading stats...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

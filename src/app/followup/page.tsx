import { FollowupContent } from "@/components/followup/FollowupContent";

export default function FollowupPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Follow-ups</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-drafted follow-up emails at day 7, 14, and 21 after applying
        </p>
      </div>
      <FollowupContent />
    </div>
  );
}

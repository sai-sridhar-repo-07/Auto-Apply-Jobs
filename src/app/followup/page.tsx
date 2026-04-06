import { FollowupContent } from "@/components/followup/FollowupContent";

export default function FollowupPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1>Follow-ups</h1>
        <p className="text-muted-foreground mt-1">
          AI-drafted follow-up emails at day 7, 14, and 21 after applying
        </p>
      </div>
      <FollowupContent />
    </div>
  );
}

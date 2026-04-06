import { FollowupContent } from "@/components/followup/FollowupContent";

export default function FollowupPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Follow-ups</h1>
        <p className="text-slate-500 mt-1">AI-drafted emails at day 7, 14, and 21 after applying</p>
      </div>
      <FollowupContent />
    </div>
  );
}

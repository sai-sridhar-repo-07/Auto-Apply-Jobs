import { ApplyContent } from "@/components/apply/ApplyContent";

export default function ApplyPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Apply Assist</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Paste a job application URL — AI reads every form field and generates your answers. You review, copy, and paste.
        </p>
      </div>
      <ApplyContent />
    </div>
  );
}

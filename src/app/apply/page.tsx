import { ApplyContent } from "@/components/apply/ApplyContent";

export default function ApplyPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1>Apply Assist</h1>
        <p className="text-muted-foreground mt-1">
          Paste a job application URL — AI reads every form field and generates your answers. You review, copy, and paste.
        </p>
      </div>
      <ApplyContent />
    </div>
  );
}

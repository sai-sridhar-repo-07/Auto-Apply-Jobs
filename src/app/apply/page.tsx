import { ApplyContent } from "@/components/apply/ApplyContent";

export default function ApplyPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Apply Assist</h1>
        <p className="text-slate-500 mt-1">AI reads every form field and generates your answers — you review, copy, paste, submit</p>
      </div>
      <ApplyContent />
    </div>
  );
}

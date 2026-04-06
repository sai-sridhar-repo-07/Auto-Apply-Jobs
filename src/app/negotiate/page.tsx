import { NegotiateContent } from "@/components/negotiate/NegotiateContent";

export default function NegotiatePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Offer Negotiation</h1>
        <p className="text-slate-500 mt-1">Market benchmarking, counter-offer scripts, and side-by-side comparisons</p>
      </div>
      <NegotiateContent />
    </div>
  );
}

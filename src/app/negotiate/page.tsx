import { NegotiateContent } from "@/components/negotiate/NegotiateContent";

export default function NegotiatePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Offer Negotiation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track offers, compare compensation, and get AI negotiation scripts
        </p>
      </div>
      <NegotiateContent />
    </div>
  );
}

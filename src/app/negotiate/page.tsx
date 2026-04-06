import { NegotiateContent } from "@/components/negotiate/NegotiateContent";

export default function NegotiatePage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1>Offer Negotiation</h1>
        <p className="text-muted-foreground mt-1">
          Track offers, compare compensation, and get AI negotiation scripts
        </p>
      </div>
      <NegotiateContent />
    </div>
  );
}

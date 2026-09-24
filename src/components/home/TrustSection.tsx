import { Truck, RotateCcw, ShieldCheck, Banknote } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Truck, title: "Free shipping", sub: "On orders over $150" },
  { icon: RotateCcw, title: "Easy returns", sub: "30-day, hassle-free" },
  { icon: Banknote, title: "Cash on delivery", sub: "Pay when it arrives" },
  { icon: ShieldCheck, title: "Secure checkout", sub: "Shop with confidence" },
] as const;

export function TrustSection() {
  return (
    <section className="bg-[#F3EEE8] mt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 px-4 md:px-8 py-9 max-w-[1600px] mx-auto w-full">
        {TRUST_ITEMS.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex gap-3 items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card text-foreground">
              <Icon size={20} strokeWidth={1.6} aria-hidden />
            </span>
            <div>
              <div className="text-sm font-semibold text-foreground">{title}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

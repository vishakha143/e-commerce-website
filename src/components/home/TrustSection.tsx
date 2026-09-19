const TRUST_ITEMS = [
  { title: "Premium Quality", sub: "Built to last" },
  { title: "Easy Returns", sub: "30-day, hassle-free" },
  { title: "Secure Checkout", sub: "Shop with confidence" },
  { title: "Free Shipping", sub: "On orders over $150" },
] as const;

export function TrustSection() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4 md:px-8 py-10 border-t border-border max-w-[1600px] mx-auto w-full">
      {TRUST_ITEMS.map((item) => (
        <div key={item.title} className="flex gap-3 items-start">
          <div className="w-[34px] h-[34px] rounded-full border-[1.5px] border-foreground shrink-0" />
          <div>
            <div className="text-sm font-semibold text-foreground">{item.title}</div>
            <div className="text-xs text-muted-foreground">{item.sub}</div>
          </div>
        </div>
      ))}
    </section>
  );
}

export function StatsCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 p-5 bg-card border border-border border-t-2 border-t-accent rounded-lg shadow-sm">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
    </div>
  );
}

export function StatsCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 p-5 bg-card border border-border rounded-lg">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
    </div>
  );
}

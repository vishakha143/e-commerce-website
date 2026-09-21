export interface BarListItem {
  label: string;
  value: number;
}

export function BarList({
  items,
  formatValue = (v) => v.toString(),
  emptyMessage = "No data yet.",
}: {
  items: BarListItem[];
  formatValue?: (value: number) => string;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium capitalize">{item.label}</span>
            <span className="text-muted-foreground">{formatValue(item.value)}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

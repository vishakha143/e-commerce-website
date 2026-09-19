import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 px-4 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

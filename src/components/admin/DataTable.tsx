import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  keyFor,
  emptyMessage = "Nothing here yet.",
}: {
  columns: Column<T>[];
  rows: T[];
  keyFor: (row: T) => string;
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-lg py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.header}
                className="text-left font-semibold text-muted-foreground px-4 py-3 whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyFor(row)} className="border-b border-border last:border-0">
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={cn("px-4 py-3 text-foreground", col.className)}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

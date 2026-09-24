import type { ReactNode } from "react";

/** Native <details> disclosure: keyboard accessible, no client JS. */
export function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-t border-border last:border-b">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="text-lg leading-none transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";

export function FilterDrawer({
  children,
  activeCount = 0,
  resultCount,
}: {
  children: ReactNode;
  /** Number of filters currently applied, shown on the button. */
  activeCount?: number;
  resultCount?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-foreground border border-border bg-card rounded-md px-3.5 py-2 cursor-pointer hover:border-foreground transition-colors"
      >
        <SlidersHorizontal size={15} />
        Filters
        {activeCount > 0 && (
          <span className="min-w-[18px] h-[18px] rounded-full bg-foreground px-1 text-[10px] font-bold leading-[18px] text-background text-center">
            {activeCount}
          </span>
        )}
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        widthClassName="w-[88%] max-w-sm"
        ariaLabel="Filters"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <span className="font-display text-lg font-bold text-foreground">Filters</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
          <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-md bg-foreground py-3.5 text-xs font-semibold tracking-wide text-background cursor-pointer"
            >
              {resultCount !== undefined
                ? `SHOW ${resultCount} PRODUCT${resultCount === 1 ? "" : "S"}`
                : "DONE"}
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}

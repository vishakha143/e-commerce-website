"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export function FilterDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center gap-2 text-sm font-medium text-foreground border border-border rounded-md px-3.5 py-2 cursor-pointer"
      >
        <SlidersHorizontal size={15} />
        Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/45"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 right-0 w-[82%] max-w-xs bg-card p-5 overflow-y-auto flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-foreground">Filters</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}

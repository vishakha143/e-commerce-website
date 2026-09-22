"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";

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

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        widthClassName="w-[82%] max-w-xs"
        ariaLabel="Filters"
      >
        <div className="flex flex-col gap-5 p-5 overflow-y-auto">
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
      </Drawer>
    </>
  );
}

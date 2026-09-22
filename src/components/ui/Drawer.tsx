"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  onClose,
  side = "right",
  widthClassName = "w-full max-w-[380px]",
  ariaLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  widthClassName?: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const offscreenX = side === "right" ? "100%" : "-100%";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-foreground/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={{ x: offscreenX }}
            animate={{ x: 0 }}
            exit={{ x: offscreenX }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className={cn(
              "absolute top-0 h-full bg-card shadow-xl flex flex-col",
              side === "right" ? "right-0" : "left-0",
              widthClassName,
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ANNOUNCEMENTS } from "@/lib/constants";

const ROTATE_MS = 4500;

/** One short message at a time, rotating, so each can be readable on a phone. */
export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (ANNOUNCEMENTS.length < 2) return;
    // Respect reduced-motion: keep the first message static.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="bg-foreground text-background text-center py-2.5 px-4 text-[11px] md:text-xs font-medium tracking-[0.08em]"
      role="status"
      aria-live="polite"
    >
      {ANNOUNCEMENTS[index]}
    </div>
  );
}

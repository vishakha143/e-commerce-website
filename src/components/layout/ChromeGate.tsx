"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The storefront header/footer don't belong on the admin console, which has
 * its own shell. Gated here (rather than in a route group) so the existing
 * URLs and layouts stay exactly as they are.
 */
export function ChromeGate({
  top,
  bottom,
  children,
}: {
  top: ReactNode;
  bottom: ReactNode;
  children: ReactNode;
}) {
  const inAdmin = usePathname().startsWith("/admin");

  return (
    <>
      {!inAdmin && top}
      <main id="main-content" className="flex-1 flex flex-col">
        {children}
      </main>
      {!inAdmin && bottom}
    </>
  );
}

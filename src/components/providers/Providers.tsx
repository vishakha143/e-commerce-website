"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { SyncOnLogin } from "@/components/providers/SyncOnLogin";
import { StoreHydration } from "@/components/providers/StoreHydration";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <StoreHydration />
      <SyncOnLogin />
      {children}
    </SessionProvider>
  );
}

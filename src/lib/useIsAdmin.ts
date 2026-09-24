"use client";

import { useSession } from "next-auth/react";

/** True when the signed-in account is the store admin (who manages the store but doesn't shop). */
export function useIsAdmin(): boolean {
  const { data } = useSession();
  return data?.user?.role === "admin";
}

import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex flex-col md:flex-row gap-8 px-4 md:px-8 py-8 max-w-[1200px] mx-auto w-full flex-1">
      <AccountSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

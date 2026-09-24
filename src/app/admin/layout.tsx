import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { getAdminSession } from "@/lib/authz";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const signedIn = await auth();
  if (!signedIn?.user) redirect("/login");
  // Re-verified against the database, not just the role stored in the session token.
  const session = await getAdminSession();
  if (!session) redirect("/");

  return (
    <div className="admin-theme flex flex-col md:flex-row flex-1 min-h-screen bg-background text-foreground">
      <AdminSidebar name={session.user.name ?? ""} email={session.user.email ?? ""} />
      <div className="flex-1 min-w-0 px-4 md:px-10 py-8 max-w-[1280px]">{children}</div>
    </div>
  );
}

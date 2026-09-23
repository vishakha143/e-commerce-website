import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="admin-theme flex flex-col md:flex-row flex-1 min-h-screen bg-background text-foreground">
      <AdminSidebar name={session.user.name ?? ""} email={session.user.email ?? ""} />
      <div className="flex-1 min-w-0 px-4 md:px-10 py-8 max-w-[1280px]">{children}</div>
    </div>
  );
}

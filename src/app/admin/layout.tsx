import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="flex flex-col md:flex-row gap-8 px-4 md:px-8 py-8 max-w-[1200px] mx-auto w-full flex-1">
      <AdminSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

import type { Metadata } from "next";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-5 max-w-[360px]">
      <h1 className="text-lg font-bold text-foreground">Profile</h1>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Name</span>
        <div className="px-3.5 py-3 border border-border rounded-md text-sm text-muted-foreground">
          {session?.user?.name}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Email</span>
        <div className="px-3.5 py-3 border border-border rounded-md text-sm text-muted-foreground">
          {session?.user?.email}
        </div>
      </div>
    </div>
  );
}

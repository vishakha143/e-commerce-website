import type { Metadata } from "next";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-foreground">
        Welcome back, {session?.user?.name}
      </h1>
      <p className="text-sm text-muted-foreground max-w-md">
        Manage your orders, wishlist, addresses, and account settings from here.
      </p>
    </div>
  );
}

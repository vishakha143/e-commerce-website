import { auth } from "@/lib/auth";

/** Returns the session if the caller is an admin, otherwise null. */
export async function getAdminSession() {
  const session = await auth();
  return session?.user?.role === "admin" ? session : null;
}

/** For server actions: throws unless the caller is an admin. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Forbidden");
  return session;
}

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

/**
 * Returns the session only if the caller is a *current* admin.
 *
 * Sessions are JWTs, so the role inside one is whatever it was at sign-in.
 * For admin access that is re-checked against the database on every call:
 * a demoted or deleted admin loses access immediately, and a password
 * change or reset signs out sessions issued before it.
 */
export async function getAdminSession() {
  const session = await auth();
  if (session?.user?.role !== "admin" || !session.user.id) return null;

  await connectDB();
  const user = await User.findById(session.user.id)
    .select("role passwordChangedAt")
    .lean<{ role: string; passwordChangedAt?: Date }>();
  if (!user || user.role !== "admin") return null;

  if (user.passwordChangedAt) {
    const issuedAt = session.user.issuedAt ?? 0;
    if (issuedAt < user.passwordChangedAt.getTime()) return null;
  }
  return session;
}

/** For server actions: throws unless the caller is an admin. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Forbidden");
  return session;
}

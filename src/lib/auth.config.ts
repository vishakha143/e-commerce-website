import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe config shared by src/proxy.ts (route protection) and the full
 * src/lib/auth.ts (adds the DB-backed Credentials provider). jwt/session
 * live here — not just in auth.ts — because proxy.ts runs its own NextAuth
 * instance with only these callbacks; without them here, `auth.user.role`
 * would be undefined in the proxy even for a real admin, since the
 * default session callback drops custom token fields.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/admin")) {
        return isLoggedIn && auth?.user?.role === "admin";
      }
      if (pathname.startsWith("/account") || pathname.startsWith("/checkout")) {
        return isLoggedIn;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

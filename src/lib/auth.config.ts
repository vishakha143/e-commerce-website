import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe config used by middleware. Keep this free of Node-only
 * imports (bcryptjs, mongoose) — the Credentials provider that needs
 * those lives in src/lib/auth.ts instead.
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
      if (pathname.startsWith("/account")) {
        return isLoggedIn;
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

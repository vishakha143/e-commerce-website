import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rateLimit";

// When the email is unknown we still run a bcrypt comparison, against a real
// hash made with the same cost as stored passwords (BCRYPT_COST), so "no such
// user" and "wrong password" take the same time and can't be told apart.
const BCRYPT_COST = 10;
let dummyHash: Promise<string> | undefined;
function getDummyHash() {
  dummyHash ??= bcrypt.hash(`dummy-${Math.random()}-${Date.now()}`, BCRYPT_COST);
  return dummyHash;
}

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function clientIp(request: Request | undefined): string {
  const forwarded = request?.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Shorter than Auth.js's 30-day default: a stolen session cookie stops working sooner.
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS, updateAge: 24 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();

        // Enforced here rather than only in the login form's server action,
        // because Auth.js also exposes /api/auth/callback/credentials, which a
        // script can call directly. Per-account and per-IP, so one password
        // can't be hammered from many addresses or many passwords from one.
        const [byAccount, byIp] = await Promise.all([
          checkRateLimit(`auth-account:${email}`, 10, 15 * 60 * 1000),
          checkRateLimit(`auth-ip:${clientIp(request)}`, 30, 15 * 60 * 1000),
        ]);
        if (!byAccount.allowed || !byIp.allowed) return null;

        await connectDB();
        const user = await User.findOne({ email }).lean();

        const isValid = await bcrypt.compare(parsed.data.password, user?.password ?? (await getDummyHash()));
        if (!user || !isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});

import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { sendPasswordResetEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/constants";

const TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Always resolves the same way whether or not the email is registered, so
 * the caller can show one generic "check your email" response that never
 * reveals account existence. If the account exists, generates a token,
 * stores only its hash (the raw token lives solely in the emailed link),
 * and sends the reset email.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return;

  const rawToken = randomBytes(32).toString("base64url");
  await PasswordResetToken.create({
    user: user._id,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });

  const resetUrl = `${SITE_URL}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(user.email, resetUrl);
}

export interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

/**
 * Validates the token (exists, unused, unexpired) before touching the
 * password, then immediately marks it used so the same link can't be
 * replayed to reset the password again.
 */
export async function resetPassword(
  rawToken: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  await connectDB();

  const resetToken = await PasswordResetToken.findOne({ tokenHash: hashToken(rawToken) });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return {
      success: false,
      error: "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ _id: resetToken.user }, { password: passwordHash });

  resetToken.usedAt = new Date();
  await resetToken.save();

  return { success: true };
}

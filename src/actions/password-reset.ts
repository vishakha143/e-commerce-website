"use server";

import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { requestPasswordReset, resetPassword } from "@/services/passwordResetService";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export interface ForgotPasswordState {
  submitted?: boolean;
  error?: string;
}

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`password-reset-request:${ip}`, 3, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { error: "Too many requests. Please try again in a few minutes." };
  }

  const parsed = forgotPasswordSchema.safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }

  // Best-effort: a delivery failure (e.g. email not yet configured) must
  // not reveal account existence either, so it's swallowed here too — the
  // same generic response is always shown regardless of outcome.
  await requestPasswordReset(parsed.data.email).catch((err) => {
    console.error("Password reset request failed", err);
  });

  return { submitted: true };
}

export interface ResetPasswordState {
  success?: boolean;
  error?: string;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`password-reset-submit:${ip}`, 10, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const token = String(formData.get("token") ?? "");
  if (!token) {
    return { error: "This reset link is invalid. Please request a new one." };
  }

  const parsed = resetPasswordSchema.safeParse({
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await resetPassword(token, parsed.data.password);
  if (!result.success) {
    return { error: result.error };
  }

  return { success: true };
}

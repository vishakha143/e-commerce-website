import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage(props: PageProps<"/reset-password">) {
  const sp = await props.searchParams;
  const tokenParam = sp.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

  return (
    <div className="flex items-center justify-center py-16 px-4 flex-1">
      <div className="w-full max-w-[440px] p-8 md:p-11 bg-card border border-border rounded-lg shadow-sm">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-foreground">Invalid link</h1>
            <p className="text-sm text-muted-foreground">
              This password reset link is missing its token. Please request a new one.
            </p>
            <Link href="/forgot-password" className="text-sm text-foreground underline">
              Request a new link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

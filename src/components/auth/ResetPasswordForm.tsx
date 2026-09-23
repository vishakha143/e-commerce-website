"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction, type ResetPasswordState } from "@/actions/password-reset";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  useEffect(() => {
    if (!state.success) return;
    const timer = setTimeout(() => router.push("/login"), 2000);
    return () => clearTimeout(timer);
  }, [state.success, router]);

  if (state.success) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-foreground">Password updated</h1>
        <p className="text-sm text-muted-foreground">Redirecting you to login…</p>
        <Link href="/login" className="text-sm text-foreground underline">
          Go to login now
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <input type="hidden" name="token" value={token} />

      <h1 className="text-2xl font-bold text-foreground">Set a new password</h1>

      {state.error && (
        <p className="text-sm text-[#7A3E33] bg-[#FCEFEC] border border-[#EAD6D0] rounded-md px-3.5 py-2.5">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">New Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="px-3.5 py-3 border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Confirm New Password</span>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          className="px-3.5 py-3 border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-foreground"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-60"
      >
        {pending ? "UPDATING..." : "UPDATE PASSWORD"}
      </button>
    </form>
  );
}

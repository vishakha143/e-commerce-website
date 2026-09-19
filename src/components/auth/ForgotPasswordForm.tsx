"use client";

import { useState } from "react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          Password reset emails aren&apos;t set up yet for this project. Once email
          delivery is configured, a reset link will be sent to your address here.
        </p>
        <Link href="/login" className="text-sm text-foreground underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="flex flex-col gap-[18px]"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Email</span>
        <input
          type="email"
          name="email"
          required
          className="px-3.5 py-3 border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-foreground"
        />
      </label>

      <button
        type="submit"
        className="w-full py-3.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer"
      >
        SEND RESET LINK
      </button>

      <Link href="/login" className="text-center text-sm text-foreground underline">
        Back to login
      </Link>
    </form>
  );
}

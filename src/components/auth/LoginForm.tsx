"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/actions/user";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground mt-1">Continue shopping with us.</p>
      </div>

      {state.error && (
        <p className="text-sm text-[#7A3E33] bg-[#FCEFEC] border border-[#EAD6D0] rounded-md px-3.5 py-2.5">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Email</span>
        <input
          type="email"
          name="email"
          required
          className="px-3.5 py-3 border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="px-3.5 py-3 border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-foreground"
        />
        <Link href="/forgot-password" className="text-xs text-foreground underline self-end mt-0.5">
          Forgot password?
        </Link>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-60"
      >
        {pending ? "LOGGING IN..." : "LOGIN"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-foreground underline">
          Create account
        </Link>
      </p>
    </form>
  );
}

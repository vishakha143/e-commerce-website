"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "@/actions/user";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <h1 className="text-2xl font-bold text-foreground">Create Account</h1>

      {state.error && (
        <p className="text-sm text-[#7A3E33] bg-[#FCEFEC] border border-[#EAD6D0] rounded-md px-3.5 py-2.5">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Name</span>
        <input
          type="text"
          name="name"
          required
          minLength={2}
          className="px-3.5 py-3 border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-foreground"
        />
      </label>

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
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Confirm Password</span>
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
        {pending ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline">
          Login
        </Link>
      </p>
    </form>
  );
}

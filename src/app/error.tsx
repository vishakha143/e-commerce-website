"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-[#FCEFEC] flex items-center justify-center text-[#7A3E33] text-2xl">
        !
      </div>
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        An unexpected error occurred. Please try again, or head back to the homepage.
      </p>
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={reset}
          className="px-5 py-3 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer"
        >
          TRY AGAIN
        </button>
        <Link
          href="/"
          className="px-5 py-3 border border-foreground text-foreground rounded-md text-xs font-semibold tracking-wide"
        >
          GO HOME
        </Link>
      </div>
    </div>
  );
}

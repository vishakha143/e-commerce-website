import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 px-4 text-center">
      <p className="text-sm font-semibold tracking-[0.12em] text-muted-foreground">404</p>
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="flex gap-3 mt-2">
        <Link
          href="/"
          className="px-5 py-3 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide"
        >
          GO HOME
        </Link>
        <Link
          href="/shop"
          className="px-5 py-3 border border-foreground text-foreground rounded-md text-xs font-semibold tracking-wide"
        >
          SHOP ALL
        </Link>
      </div>
    </div>
  );
}

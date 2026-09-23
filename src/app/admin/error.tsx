"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 py-10">
      <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        This admin page failed to load. Your data hasn&apos;t been changed.
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer"
      >
        TRY AGAIN
      </button>
    </div>
  );
}

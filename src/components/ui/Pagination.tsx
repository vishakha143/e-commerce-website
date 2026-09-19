import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  basePath,
  searchParams,
  page,
  totalPages,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(target: number) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    );
    if (target <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(target));
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        className={cn(
          "px-3 py-1.5 text-sm rounded-md border border-border",
          page === 1 && "pointer-events-none opacity-40",
        )}
      >
        Prev
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          className={cn(
            "w-8 h-8 flex items-center justify-center text-sm rounded-md",
            p === page ? "bg-foreground text-background" : "text-foreground",
          )}
        >
          {p}
        </Link>
      ))}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        className={cn(
          "px-3 py-1.5 text-sm rounded-md border border-border",
          page === totalPages && "pointer-events-none opacity-40",
        )}
      >
        Next
      </Link>
    </nav>
  );
}

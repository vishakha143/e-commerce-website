import Link from "next/link";

export function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold tracking-[0.18em] text-accent mb-1.5">{eyebrow.toUpperCase()}</p>
        )}
        <h2 className="font-display text-2xl md:text-[32px] font-bold leading-tight text-foreground">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-xs font-semibold tracking-wide text-foreground underline underline-offset-4">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

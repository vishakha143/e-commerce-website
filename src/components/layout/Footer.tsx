import { BRAND_NAME, FOOTER_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-foreground text-background px-4 md:px-11 py-11 mt-auto">
      <div className="max-w-[1600px] mx-auto flex flex-wrap justify-between gap-10">
        <div className="flex flex-col gap-2 max-w-[220px]">
          <div className="text-base font-extrabold">{BRAND_NAME.toUpperCase()}</div>
          <p className="text-xs leading-relaxed text-background/70">
            Modern essentials, made to last.
          </p>
        </div>

        <div className="flex gap-14 text-xs leading-loose text-background/80 flex-wrap">
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <div className="font-semibold text-background mb-2 tracking-wide">
                {heading}
              </div>
              {links.map((link) => (
                <div key={link}>{link}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

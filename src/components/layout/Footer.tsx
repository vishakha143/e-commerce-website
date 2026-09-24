import Link from "next/link";
import { BRAND_NAME, FOOTER_LINKS } from "@/lib/constants";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="bg-[#1C1917] text-[#F5F1EC] mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 md:px-11 pt-12 pb-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-3 max-w-[300px]">
            <Logo className="text-[#F5F1EC]" />
            <p className="text-sm leading-relaxed text-[#F5F1EC]/70">
              Modern essentials, made to last. Everyday pieces for every you, delivered to your door.
            </p>
            <p className="text-xs text-[#F5F1EC]/50">Cash on delivery available · Easy 30-day returns</p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <nav key={heading} aria-label={heading}>
              <div className="text-[11px] font-semibold tracking-[0.16em] text-[#F5F1EC]/50 mb-4">{heading}</div>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#F5F1EC]/85 hover:text-white hover:underline underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 text-xs text-[#F5F1EC]/50">
          <span>
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </span>
          <span>Secure checkout · Free shipping over $150</span>
        </div>
      </div>
    </footer>
  );
}

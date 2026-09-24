import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { Providers } from "@/components/providers/Providers";
import { BRAND_NAME, SITE_URL } from "@/lib/constants";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Editorial serif for headings, matching the campaign artwork's typography.
const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const DESCRIPTION =
  "Modern essentials for a better you — men's, women's, footwear, and accessories.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_NAME} — Modern Essentials`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} — Modern Essentials`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — Modern Essentials`,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-md focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <Providers>
          <ChromeGate
            top={
              <>
                <AnnouncementBar />
                <Navbar />
              </>
            }
            bottom={<Footer />}
          >
            {children}
          </ChromeGate>
        </Providers>
      </body>
    </html>
  );
}

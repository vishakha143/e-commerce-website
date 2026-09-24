import type { NextConfig } from "next";

// CSP only in production: Turbopack/React Fast Refresh inject inline
// scripts and use eval in dev that a strict policy would block, and
// there's no security benefit to enforcing it against a local dev server.
const isProd = process.env.NODE_ENV === "production";

// A per-request nonce (the officially "correct" way to allow Next.js's own
// inline scripts without 'unsafe-inline') was tried first via src/proxy.ts
// and tested against a real production build — Next.js 16 / Turbopack did
// not pick the nonce up on its own inline scripts or its chunk <script>
// tags (confirmed by actual CSP violation errors in the browser console,
// not a guess), so a nonce-only policy broke the entire site. Falling
// back to 'unsafe-inline'/'unsafe-eval' for script-src is the documented
// Next.js fallback when the nonce approach isn't viable — this still
// blocks the things that matter most here (loading a script from an
// attacker-controlled external origin, framing, arbitrary form targets),
// it just doesn't stop an inline <script> injected via an XSS that
// bypasses React's own escaping — and this app has exactly one
// dangerouslySetInnerHTML call (JSON-LD, type="application/ld+json",
// which script-src doesn't even govern), already escaped via safeJsonLd.
const cspDirectives = [
  "default-src 'self'",
  "img-src 'self' https://res.cloudinary.com data:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          ...(isProd ? [{ key: "Content-Security-Policy", value: cspDirectives }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;

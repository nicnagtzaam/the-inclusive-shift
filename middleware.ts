// Section 27 — security headers applied to every response.
// Section 28 — HTTPS/HSTS. Cloud Run terminates TLS for us; HSTS is safe to
// set once you've confirmed production is fully served over HTTPS (it is,
// by default, on Cloud Run/Firebase Hosting — but don't enable HSTS with a
// long max-age until you're certain, per Section 28's own caution).

import { NextResponse, type NextRequest } from "next/server";

// Only the third parties this site actually embeds. Do not widen this
// without a reason — Section 31.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://open.spotify.com https://assets.calendly.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://storage.googleapis.com https://i.scdn.co",
  "frame-src https://open.spotify.com https://calendly.com",
  "connect-src 'self'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Section 41 caching strategy, implemented at the HTTP layer rather than via
// Next.js ISR. Why: Cloud Run runs multiple ephemeral instances and scales to
// zero, so Next's on-disk ISR cache doesn't work correctly there (each
// instance has its own disk, and it's wiped on scale-down) — that's a known
// gap, not a hypothetical. Instead, public pages are rendered dynamically
// (`export const dynamic = "force-dynamic"` on each page) and cached at the
// HTTP layer by Firebase Hosting's CDN, keyed on this Cache-Control header.
// `stale-while-revalidate` means visitors almost always get a cached response
// instantly while the CDN quietly refreshes it in the background.
const PUBLIC_CACHE_HEADER = "public, s-maxage=300, stale-while-revalidate=3600";

function isPublicContentPath(pathname: string): boolean {
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return false;
  return true;
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  res.headers.set("Content-Security-Policy", CSP);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-Frame-Options", "DENY");
  // Enable once production HTTPS is fully confirmed (Section 28):
  // res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  const { pathname } = req.nextUrl;
  if (isPublicContentPath(pathname)) {
    res.headers.set("Cache-Control", PUBLIC_CACHE_HEADER);
  } else {
    // Admin and API responses must never be cached by a shared CDN cache —
    // some of them are per-user/authenticated (Section 24).
    res.headers.set("Cache-Control", "private, no-store");
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

// Section 29 — rate limiting for auth/admin/API/search endpoints.
//
// This is a Firestore-backed fixed-window limiter: simple, no extra
// infrastructure (no Redis/Memorystore — that would violate Section 45's
// "no unnecessary services" principle for this scale). It's good enough for
// a low-traffic single-admin site. If traffic grows enough for Firestore
// read/write cost from rate-limit checks to matter, that's a real signal to
// revisit — not a reason to add Redis pre-emptively today.

import { getDb } from "./firebase-admin";

interface RateLimitOptions {
  key: string; // e.g. `login:${ip}` or `api:episodes:${ip}`
  limit: number;
  windowSeconds: number;
}

export async function checkRateLimit({ key, limit, windowSeconds }: RateLimitOptions): Promise<{ allowed: boolean; remaining: number }> {
  const windowId = Math.floor(Date.now() / 1000 / windowSeconds);
  const docId = `${key}:${windowId}`;
  const ref = getDb().collection("rateLimits").doc(docId);

  const result = await getDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists ? (snap.data()?.count as number) : 0;
    if (current >= limit) {
      return { allowed: false, remaining: 0 };
    }
    tx.set(
      ref,
      {
        count: current + 1,
        // TTL field — enable a Firestore TTL policy on rateLimits.expiresAt
        // in the console so these documents self-delete and don't accumulate.
        expiresAt: new Date(Date.now() + windowSeconds * 2 * 1000),
      },
      { merge: true }
    );
    return { allowed: true, remaining: limit - current - 1 };
  });

  return result;
}

// Sensible defaults per endpoint class (Section 29: don't rate-limit ordinary
// public pages, do rate-limit auth/admin/API/search).
export const RATE_LIMITS = {
  api: { limit: 60, windowSeconds: 60 },
  search: { limit: 30, windowSeconds: 60 },
  adminWrite: { limit: 30, windowSeconds: 60 },
} as const;

export function clientIp(req: Request): string {
  // Cloud Run sits behind Google Front End; the real client IP is the first
  // entry in X-Forwarded-For.
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() ?? "unknown";
}

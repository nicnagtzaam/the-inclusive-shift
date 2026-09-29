// Section 5/13 — Content API: list + create episodes.
// GET is intentionally public (read-only, published-only) so the public
// site's cached pages can be regenerated without hitting Firestore on every
// visitor request (Section 41). POST requires an authenticated admin.

import { NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth";
import { episodeInputSchema } from "@/lib/validation";
import { checkRateLimit, clientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit";
import { nanoid } from "nanoid";

export async function GET(req: Request) {
  const { allowed } = await checkRateLimit({ key: `api:episodes:${clientIp(req)}`, ...RATE_LIMITS.api });
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const snap = await getDb()
    .collection(COLLECTIONS.episodes)
    .where("status", "==", "published")
    .orderBy("episodeNumber", "desc")
    .get();

  return NextResponse.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export async function POST(req: Request) {
  let identity;
  try {
    identity = requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit({ key: `admin:episodes:create:${identity.email}`, ...RATE_LIMITS.adminWrite });
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json();
  const parsed = episodeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const id = nanoid();
  const now = new Date().toISOString();
  const episode = {
    ...parsed.data,
    id,
    status: "draft" as const,
    createdAt: now,
    updatedAt: now,
  };

  await getDb().collection(COLLECTIONS.episodes).doc(id).set(episode);
  await logAdminAction("episode.created", identity.email, { type: "episode", id });

  return NextResponse.json(episode, { status: 201 });
}

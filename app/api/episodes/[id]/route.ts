import { NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth";
import { episodeInputSchema } from "@/lib/validation";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit";
// Note: no revalidatePath() here. Public pages render dynamically
// (force-dynamic) and read Firestore directly via the Admin SDK, which
// Next's fetch/data cache doesn't touch — there's nothing for revalidatePath
// to invalidate. Freshness is bounded by the CDN's s-maxage in
// middleware.ts (currently 5 minutes), not by an explicit purge on write.

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  let identity;
  try {
    identity = requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit({ key: `admin:episodes:update:${identity.email}`, ...RATE_LIMITS.adminWrite });
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json();
  const parsed = episodeInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const ref = getDb().collection(COLLECTIONS.episodes).doc(params.id);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await ref.set({ ...parsed.data, updatedAt: new Date().toISOString() }, { merge: true });
  await logAdminAction("episode.updated", identity.email, { type: "episode", id: params.id });

  return NextResponse.json({ ok: true });
}

// Section 50 — prefer status transitions over hard deletes for episodes.
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  let identity;
  try {
    identity = requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await getDb().collection(COLLECTIONS.episodes).doc(params.id).set(
    { status: "archived", updatedAt: new Date().toISOString() },
    { merge: true }
  );
  await logAdminAction("episode.archived", identity.email, { type: "episode", id: params.id });

  return NextResponse.json({ ok: true });
}

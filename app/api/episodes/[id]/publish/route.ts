// Section 13 publishing workflow, as its own endpoint so publish/unpublish
// carries its own CSRF-relevant state transition and audit trail, separate
// from a general-purpose field edit.

import { NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";

// Section 13 asks for publish to immediately refresh affected cached pages.
// On Vercel-style hosting that's revalidatePath(); on Cloud Run there's no
// working Next.js page cache to invalidate (see middleware.ts comment), so
// "immediate" here really means "within the CDN's 5-minute s-maxage window."
// If truly instant post-publish freshness matters later, the real fix is a
// Cloud CDN/Firebase Hosting cache-purge API call here — that's genuinely
// more infrastructure than this scale needs today (Section 45), so it's
// deliberately not built. Flagging it so it's a decision, not an oversight.

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let identity;
  try {
    identity = requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { publish } = await req.json(); // { publish: true } or { publish: false }
  const ref = getDb().collection(COLLECTIONS.episodes).doc(params.id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date().toISOString();
  await ref.set(
    {
      status: publish ? "published" : "draft",
      publishedAt: publish ? now : snap.data()?.publishedAt ?? null,
      updatedAt: now,
    },
    { merge: true }
  );

  await logAdminAction(publish ? "episode.published" : "episode.unpublished", identity.email, {
    type: "episode",
    id: params.id,
  });

  return NextResponse.json({ ok: true, status: publish ? "published" : "draft" });
}

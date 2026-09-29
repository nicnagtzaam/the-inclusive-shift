import { NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth";
import { guestInputSchema } from "@/lib/validation";
import { checkRateLimit, clientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit";
import { nanoid } from "nanoid";

export async function GET(req: Request) {
  const { allowed } = await checkRateLimit({ key: `api:guests:${clientIp(req)}`, ...RATE_LIMITS.api });
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const snap = await getDb().collection(COLLECTIONS.guests).orderBy("name").get();
  return NextResponse.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export async function POST(req: Request) {
  let identity;
  try {
    identity = requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = guestInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const id = nanoid();
  const now = new Date().toISOString();
  const guest = { ...parsed.data, id, episodes: [], topics: [], createdAt: now, updatedAt: now };

  await getDb().collection(COLLECTIONS.guests).doc(id).set(guest);
  await logAdminAction("guest.updated", identity.email, { type: "guest", id });

  return NextResponse.json(guest, { status: 201 });
}

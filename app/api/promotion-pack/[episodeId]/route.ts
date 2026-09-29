import { NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth";
import { generatePromotionPack } from "@/lib/promotion-pack";
import type { Episode } from "@/lib/models/episode";

export async function GET(req: Request, { params }: { params: { episodeId: string } }) {
  try {
    requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const snap = await getDb().collection(COLLECTIONS.episodes).doc(params.episodeId).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const episode = { id: snap.id, ...snap.data() } as Episode;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://theinclusiveshift.com";

  return NextResponse.json(generatePromotionPack(episode, siteUrl));
}

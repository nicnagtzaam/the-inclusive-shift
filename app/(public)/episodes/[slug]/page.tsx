import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import type { Episode } from "@/lib/models/episode";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic"; // see middleware.ts for actual HTTP caching (Cloud Run has no working ISR cache)

async function getEpisode(slug: string): Promise<Episode | null> {
  const snap = await getDb()
    .collection(COLLECTIONS.episodes)
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();
  const doc = snap.docs[0];
  if (!doc) return null;
  return { id: doc.id, ...doc.data() } as Episode;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const episode = await getEpisode(params.slug);
  if (!episode) return {};
  return {
    title: episode.seoTitle || episode.title,
    description: episode.seoDescription || episode.shortDescription,
  };
}

export default async function EpisodeDetailPage({ params }: { params: { slug: string } }) {
  const episode = await getEpisode(params.slug);
  if (!episode) notFound();

  return (
    <main>
      <p>EP. {episode.episodeNumber}</p>
      <h1>{episode.title}</h1>
      <p>with {episode.guestName}, {episode.guestRole}, {episode.guestOrganisation}</p>
      <p>{episode.fullDescription}</p>
      {episode.spotifyUrl && <a href={episode.spotifyUrl}>Listen on Spotify</a>}
      {episode.transcript && (
        <details>
          <summary>Transcript</summary>
          <p>{episode.transcript}</p>
        </details>
      )}
    </main>
  );
}

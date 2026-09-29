import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import type { Episode } from "@/lib/models/episode";

export const dynamic = "force-dynamic"; // see middleware.ts for actual HTTP caching (Cloud Run has no working ISR cache)

export default async function EpisodesPage() {
  const snap = await getDb()
    .collection(COLLECTIONS.episodes)
    .where("status", "==", "published")
    .orderBy("episodeNumber", "desc")
    .get();

  const episodes = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Episode));

  return (
    <main>
      <h1>All episodes</h1>
      <ul>
        {episodes.map((ep) => (
          <li key={ep.id}>
            <a href={`/episodes/${ep.slug}`}>
              EP.{ep.episodeNumber} — {ep.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

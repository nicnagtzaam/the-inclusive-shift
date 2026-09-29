// Homepage — Section 12-19 of the design brief.
//
// IMPORTANT: this is a functional scaffold (real data fetching, real
// revalidation), not a pixel-accurate implementation of the approved Figma
// file. Turning this into the actual approved visual design is separate
// front-end work — see README "From scaffold to Figma-accurate UI".

import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import type { Episode } from "@/lib/models/episode";

export const dynamic = "force-dynamic"; // see middleware.ts for actual HTTP caching (Cloud Run has no working ISR cache)

async function getFeaturedEpisode(): Promise<Episode | null> {
  const snap = await getDb()
    .collection(COLLECTIONS.episodes)
    .where("status", "==", "published")
    .where("featured", "==", true)
    .orderBy("episodeNumber", "desc")
    .limit(1)
    .get();

  const doc = snap.docs[0];
  if (!doc) return null;
  return { id: doc.id, ...doc.data() } as Episode;
}

async function getLatestEpisodes(limit = 3): Promise<Episode[]> {
  const snap = await getDb()
    .collection(COLLECTIONS.episodes)
    .where("status", "==", "published")
    .orderBy("episodeNumber", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Episode));
}

export default async function HomePage() {
  const [featured, latest] = await Promise.all([getFeaturedEpisode(), getLatestEpisodes()]);

  return (
    <main>
      <section>
        <h1>THE INCLUSIVE SHIFT</h1>
        <p>
          Conversations changing how we think about inclusion, neurodiversity, leadership and
          what it means to create a more human world.
        </p>
      </section>

      {featured && (
        <section aria-label="Featured episode">
          <p>Featured Episode · {featured.episodeNumber}</p>
          <h2>{featured.title}</h2>
          <p>with {featured.guestName}</p>
        </section>
      )}

      <section aria-label="Latest episodes">
        <h2>Latest episodes</h2>
        <ul>
          {latest.map((ep) => (
            <li key={ep.id}>
              EP.{ep.episodeNumber} — {ep.title}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import type { Guest } from "@/lib/models/guest";
import type { Episode } from "@/lib/models/episode";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic"; // see middleware.ts for actual HTTP caching (Cloud Run has no working ISR cache)

export default async function GuestProfilePage({ params }: { params: { slug: string } }) {
  const snap = await getDb().collection(COLLECTIONS.guests).where("slug", "==", params.slug).limit(1).get();
  const doc = snap.docs[0];
  if (!doc) notFound();
  const guest = { id: doc.id, ...doc.data() } as Guest;

  // Guest pages automatically display associated episodes (Section 9).
  const episodesSnap = guest.episodes.length
    ? await getDb().collection(COLLECTIONS.episodes).where("__name__", "in", guest.episodes.slice(0, 10)).get()
    : null;
  const episodes = episodesSnap ? episodesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Episode)) : [];

  return (
    <main>
      <h1>{guest.name}</h1>
      <p>{guest.role}, {guest.organisation}</p>
      <p>{guest.bio}</p>
      <h2>Episode appearances</h2>
      <ul>
        {episodes.map((ep) => (
          <li key={ep.id}><a href={`/episodes/${ep.slug}`}>EP.{ep.episodeNumber} — {ep.title}</a></li>
        ))}
      </ul>
    </main>
  );
}

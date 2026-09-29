// Admin dashboard — Section 7.

import { getDb, COLLECTIONS } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic"; // admin views should always be fresh, not cached

export default async function AdminDashboard() {
  const [episodesSnap, guestsSnap, resourcesSnap, recentSnap] = await Promise.all([
    getDb().collection(COLLECTIONS.episodes).count().get(),
    getDb().collection(COLLECTIONS.guests).count().get(),
    getDb().collection(COLLECTIONS.resources).count().get(),
    getDb().collection(COLLECTIONS.episodes).orderBy("updatedAt", "desc").limit(5).get(),
  ]);

  return (
    <div>
      <section>
        <p>{episodesSnap.data().count} Episodes</p>
        <p>{guestsSnap.data().count} Guests</p>
        <p>{resourcesSnap.data().count} Resources</p>
      </section>

      <section>
        <a href="/admin/episodes/new">+ New Episode</a>
        <a href="/admin/guests">+ New Guest</a>
        <a href="/admin/resources">+ New Resource</a>
      </section>

      <section>
        <h2>Recent episodes</h2>
        <ul>
          {recentSnap.docs.map((d) => {
            const data = d.data();
            return (
              <li key={d.id}>
                Episode {data.episodeNumber} — {data.status}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

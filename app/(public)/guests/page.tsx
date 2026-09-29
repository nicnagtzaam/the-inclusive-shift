import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import type { Guest } from "@/lib/models/guest";

export const dynamic = "force-dynamic"; // see middleware.ts for actual HTTP caching (Cloud Run has no working ISR cache)

export default async function GuestsPage() {
  const snap = await getDb().collection(COLLECTIONS.guests).orderBy("name").get();
  const guests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Guest));

  return (
    <main>
      <h1>Guests</h1>
      <ul>
        {guests.map((g) => (
          <li key={g.id}>
            <a href={`/guests/${g.slug}`}>{g.name} — {g.role}, {g.organisation}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}

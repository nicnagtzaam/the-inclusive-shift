import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import type { Resource } from "@/lib/models/resource";

export const dynamic = "force-dynamic"; // see middleware.ts for actual HTTP caching (Cloud Run has no working ISR cache)

export default async function ResourcesPage() {
  const snap = await getDb().collection(COLLECTIONS.resources).orderBy("title").get();
  const resources = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Resource));

  return (
    <main>
      <h1>Resources</h1>
      <ul>
        {resources.map((r) => (
          <li key={r.id}>
            <a href={r.url}>[{r.type}] {r.title}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}

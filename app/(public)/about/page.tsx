// About page content is CMS-managed per Section 12 (structured fields, not a
// full page builder). This scaffold reads a single "about" doc from the
// settings collection; the admin editor for it lives at /admin (not yet
// scaffolded here — same pattern as episodes/guests/resources).

import { getDb, COLLECTIONS } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic"; // see middleware.ts for actual HTTP caching (Cloud Run has no working ISR cache)

export default async function AboutPage() {
  const doc = await getDb().collection(COLLECTIONS.settings).doc("about").get();
  const content = doc.exists ? doc.data() : null;

  return (
    <main>
      <h1>About The Inclusive Shift</h1>
      <p>{content?.heroStatement ?? "Content managed from /admin — not yet published."}</p>
    </main>
  );
}

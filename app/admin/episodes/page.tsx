import { getDb, COLLECTIONS } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export default async function AdminEpisodesList() {
  const snap = await getDb().collection(COLLECTIONS.episodes).orderBy("episodeNumber", "desc").get();

  return (
    <div>
      <h1>Episodes</h1>
      <a href="/admin/episodes/new">+ New Episode</a>
      <table>
        <tbody>
          {snap.docs.map((d) => {
            const data = d.data();
            return (
              <tr key={d.id}>
                <td>EP.{data.episodeNumber}</td>
                <td>{data.title}</td>
                <td>{data.status}</td>
                <td><a href={`/admin/episodes/${d.id}`}>Edit</a></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

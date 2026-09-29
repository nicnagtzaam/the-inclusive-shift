// Section 13, steps 2-9 — the publishing workflow's data-entry step. Deliberately
// a plain HTML form posting to the API route rather than a heavy form
// library — the owner is the only user and the field count is manageable.
// A production pass should add client-side validation mirroring
// lib/validation.ts, and richer guest/topic pickers, but the write path
// (POST /api/episodes) already enforces validation server-side regardless.

export default function NewEpisodePage() {
  return (
    <div>
      <h1>New episode</h1>
      <form action="/api/episodes" method="post">
        <label>Episode number <input name="episodeNumber" type="number" required /></label>
        <label>Title <input name="title" required /></label>
        <label>Slug <input name="slug" required /></label>
        <label>Short description <textarea name="shortDescription" required /></label>
        <label>Full description <textarea name="fullDescription" required /></label>
        <label>Guest name <input name="guestName" required /></label>
        <label>Spotify URL <input name="spotifyUrl" type="url" /></label>
        {/* Image upload (guestImage/episodeArtwork) goes through a signed
            Cloud Storage upload URL — see README "Media uploads" — not a
            direct multipart POST to this form. */}
        <button type="submit">Save as draft</button>
      </form>
      <p>Publishing is a separate step from the episode list once the draft is saved.</p>
    </div>
  );
}

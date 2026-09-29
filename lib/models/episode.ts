// Episode content model — matches Section 8 of the infra brief.
// Keep this as the single source of truth for the shape of an episode.

export type EpisodeStatus = "draft" | "published" | "archived";

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  publicationDate: string; // ISO date
  duration: string; // e.g. "32 min" — display string, not seconds, to match Figma copy
  guestId: string;
  // Denormalised guest fields for fast list rendering without a join.
  // Source of truth remains the Guest record — keep these two in sync on write.
  guestName: string;
  guestRole: string;
  guestOrganisation: string;
  guestImage: string; // Cloud Storage path
  episodeArtwork: string; // Cloud Storage path
  spotifyUrl?: string;
  podcastUrl?: string; // Apple Podcasts / other platforms
  riversideUrl?: string; // private/admin-only, never rendered on public pages
  transcript?: string;
  topics: string[]; // Topic ids
  quotes: { text: string; attribution?: string }[];
  resources: string[]; // Resource ids
  relatedEpisodes: string[]; // Episode ids, curated or auto-derived from shared topics
  featured: boolean;
  status: EpisodeStatus;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Fields the admin UI actually collects; server derives id/timestamps/status transitions.
export type EpisodeInput = Omit<
  Episode,
  "id" | "createdAt" | "updatedAt" | "publishedAt" | "status"
>;

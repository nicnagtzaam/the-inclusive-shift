// Section 19/48 — Promotion Pack generation. Deliberately template-based,
// not AI-generated (that's explicitly a Section 20/56 future option, not a
// v1 requirement) and never auto-publishes anywhere — it only produces
// editable text the owner copies and posts manually.

import type { Episode } from "./models/episode";

export interface PromotionPack {
  websiteUrl: string;
  linkedin: string;
  instagram: string;
  shortAnnouncement: string;
  guestMessage: string;
}

export function generatePromotionPack(episode: Episode, siteUrl: string): PromotionPack {
  const url = `${siteUrl}/episodes/${episode.slug}`;

  return {
    websiteUrl: url,
    linkedin: `New episode of The Inclusive Shift 🎙️\n\nEpisode ${episode.episodeNumber}: ${episode.title}\n\nI sat down with ${episode.guestName} (${episode.guestRole}, ${episode.guestOrganisation}) to talk about ${episode.shortDescription}\n\nListen here: ${url}`,
    instagram: `🎙️ New episode: "${episode.title}" with ${episode.guestName}. Link in bio.`,
    shortAnnouncement: `Episode ${episode.episodeNumber} is live: ${episode.title} — with ${episode.guestName}. ${url}`,
    guestMessage: `Hi ${episode.guestName.split(" ")[0]}, our conversation is live! Feel free to share: ${url} — thank you again for such a generous conversation.`,
  };
}

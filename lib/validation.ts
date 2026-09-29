// Section 26 — all CMS input is validated server-side with zod before it
// ever reaches Firestore, regardless of who's authenticated.

import { z } from "zod";

// Reusable primitives
const slug = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase, hyphenated, alphanumeric");

const shortText = z.string().min(1).max(300);
const longText = z.string().min(1).max(20000); // generous, but bounded — protects against oversized-content abuse
const url = z.string().url().max(2000);
const gcsPath = z.string().min(1).max(500); // validated further at upload time (lib/uploads.ts)

export const episodeInputSchema = z.object({
  episodeNumber: z.number().int().positive(),
  title: shortText,
  slug,
  shortDescription: shortText,
  fullDescription: longText,
  publicationDate: z.string().datetime().or(z.string().date()),
  duration: z.string().max(20),
  guestId: z.string().min(1),
  guestName: shortText,
  guestRole: shortText,
  guestOrganisation: shortText,
  guestImage: gcsPath,
  episodeArtwork: gcsPath,
  spotifyUrl: url.optional(),
  podcastUrl: url.optional(),
  riversideUrl: url.optional(),
  transcript: longText.optional(),
  topics: z.array(z.string()).max(20),
  quotes: z.array(z.object({ text: z.string().max(1000), attribution: z.string().max(200).optional() })).max(20),
  resources: z.array(z.string()).max(50),
  relatedEpisodes: z.array(z.string()).max(10),
  featured: z.boolean(),
  seoTitle: shortText.optional(),
  seoDescription: shortText.optional(),
  ogImage: gcsPath.optional(),
});

export const guestInputSchema = z.object({
  name: shortText,
  slug,
  photo: gcsPath,
  role: shortText,
  organisation: shortText,
  bio: longText,
  website: url.optional(),
  socialLinks: z.array(z.object({ platform: z.string().max(50), url })).max(10).optional(),
  seoTitle: shortText.optional(),
  seoDescription: shortText.optional(),
  ogImage: gcsPath.optional(),
});

export const resourceInputSchema = z.object({
  title: shortText,
  slug,
  description: longText,
  type: z.enum(["article", "book", "research", "tool", "organisation", "video", "guide", "podcast"]),
  url,
  image: gcsPath.optional(),
  topics: z.array(z.string()).max(20),
  relatedEpisodes: z.array(z.string()).max(10),
  featured: z.boolean(),
  seoTitle: shortText.optional(),
  seoDescription: shortText.optional(),
});

// Section 25 — file upload constraints, checked against the actual file
// signature (magic bytes), not just the client-supplied MIME type or extension.
export const ALLOWED_UPLOAD_TYPES = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // "RIFF" — WEBP marker follows at byte 8
} as const;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

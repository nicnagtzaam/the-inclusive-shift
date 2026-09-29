// Guest content model — Section 9 of the infra brief.

export interface Guest {
  id: string;
  name: string;
  slug: string;
  photo: string; // Cloud Storage path
  role: string;
  organisation: string;
  bio: string;
  website?: string;
  socialLinks?: { platform: string; url: string }[];
  episodes: string[]; // Episode ids — kept in sync when an episode references this guest
  topics: string[]; // Topic ids, derived from the guest's episodes
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  createdAt: string;
  updatedAt: string;
}

export type GuestInput = Omit<Guest, "id" | "episodes" | "topics" | "createdAt" | "updatedAt">;

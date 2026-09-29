// Resource content model — Section 11 of the infra brief.

export type ResourceType =
  | "article"
  | "book"
  | "research"
  | "tool"
  | "organisation"
  | "video"
  | "guide"
  | "podcast";

export interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: ResourceType;
  url: string;
  image?: string;
  topics: string[];
  relatedEpisodes: string[];
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export type ResourceInput = Omit<Resource, "id" | "createdAt" | "updatedAt">;

// Topic model — Section 10 of the infra brief. Deliberately minimal: topics
// are a controlled vocabulary managed from /admin, not free text.

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

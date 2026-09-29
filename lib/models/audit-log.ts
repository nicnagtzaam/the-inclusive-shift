// Section 49 — lightweight admin activity log. One record per notable action.
// Never store credentials or full request payloads here — action + who + when + what id.

export type AuditAction =
  | "login"
  | "episode.created"
  | "episode.updated"
  | "episode.published"
  | "episode.unpublished"
  | "episode.archived"
  | "guest.updated"
  | "resource.updated"
  | "settings.updated";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actorEmail: string; // from the verified IAP identity, never client-supplied
  targetType?: "episode" | "guest" | "resource" | "settings";
  targetId?: string;
  createdAt: string;
}

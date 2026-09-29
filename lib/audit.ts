import { getDb, COLLECTIONS } from "./firebase-admin";
import type { AuditAction } from "./models/audit-log";
import { nanoid } from "nanoid";

export async function logAdminAction(
  action: AuditAction,
  actorEmail: string,
  target?: { type: "episode" | "guest" | "resource" | "settings"; id: string }
) {
  await getDb()
    .collection(COLLECTIONS.auditLog)
    .doc(nanoid())
    .set({
      action,
      actorEmail,
      targetType: target?.type ?? null,
      targetId: target?.id ?? null,
      createdAt: new Date().toISOString(),
    });
}

// Every /admin/* route passes through here first. This is the app-level
// backstop, not the primary control — IAP in front of Cloud Run (Section 22)
// is what actually stops unauthenticated traffic from reaching the app at
// all. This check exists so the app fails closed even if IAP is ever
// misconfigured, and so we can read the identity for the audit log/RBAC.

import { getAdminIdentity } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const identity = getAdminIdentity();

  if (!identity) {
    // In production this should never be reachable — IAP redirects
    // unauthenticated users to Google login before the request gets here.
    redirect("/");
  }

  return (
    <div>
      <header>
        <strong>THE INCLUSIVE SHIFT — ADMIN</strong>
        <span> · {identity.email} ({identity.role})</span>
      </header>
      <main>{children}</main>
    </div>
  );
}

// Admin authentication/authorisation — Sections 22-24 of the infra brief.
//
// Design decision: rather than building custom login (username/password,
// session tokens, MFA) inside this app, /admin/* is protected upstream by
// Identity-Aware Proxy (IAP) on the Cloud Run service. IAP terminates auth
// entirely at Google's edge — it enforces the Google login (with whatever
// MFA/passkey policy your Google Workspace/Cloud Identity requires), and
// only forwards requests from allowed principals. This app never sees an
// unauthenticated request to /admin/*.
//
// What this file does is read the identity IAP already verified, and map it
// to an application role. Do NOT trust these headers unless IAP is confirmed
// to be enabled in front of this service — see README "IAP setup" section.

import { headers } from "next/headers";

export type Role = "ADMIN" | "EDITOR";

export interface AdminIdentity {
  email: string;
  role: Role;
}

// Section 23: role-based access, defined even with a single admin today.
// Add editors here (or move this to a Firestore "admins" collection once
// there's more than a couple of people — a flat list is fine for one owner).
const ROLE_MAP: Record<string, Role> = {
  // "owner@theinclusiveshift.com": "ADMIN",
};

const DEFAULT_ROLE_FOR_UNLISTED_IAP_USER: Role | null = null; // fail closed

export function getAdminIdentity(): AdminIdentity | null {
  const h = headers();

  // IAP sets this header on every request it forwards, after verifying the
  // user's identity. Format: "accounts.google.com:user@example.com".
  const iapIdentity = h.get("x-goog-authenticated-user-email");
  if (!iapIdentity) return null;

  const email = iapIdentity.split(":").pop();
  if (!email) return null;

  const role = ROLE_MAP[email] ?? DEFAULT_ROLE_FOR_UNLISTED_IAP_USER;
  if (!role) return null; // authenticated by Google, but not authorised for this app

  return { email, role };
}

export function requireAdmin(): AdminIdentity {
  const identity = getAdminIdentity();
  if (!identity) {
    throw new Error("UNAUTHORISED");
  }
  return identity;
}

export function requireRole(min: Role): AdminIdentity {
  const identity = requireAdmin();
  if (min === "ADMIN" && identity.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return identity;
}

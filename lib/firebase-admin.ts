// Server-only Firestore/Storage access via the Admin SDK.
// This file must never be imported from a Client Component.
//
// Auth model: Cloud Run's runtime service account is granted least-privilege
// IAM roles (roles/datastore.user, roles/storage.objectAdmin scoped to the
// media bucket only) via Workload Identity — no service account JSON key is
// ever created or shipped. Locally, run `gcloud auth application-default login`
// and the Admin SDK will pick up your own credentials for development.
//
// IMPORTANT: initialization is lazy (getDb()/getMediaBucket(), not eager
// top-level exports). Next.js imports every route module during `next build`
// to analyze route config, and Secret Manager values (GCS_BUCKET, credentials)
// aren't available at build time — only at Cloud Run runtime. Eagerly calling
// a GCP API at module load time breaks the production build. Learned this the
// hard way by actually running `npm run build` against this scaffold — don't
// revert to eager initialization even though it looks tidier.

import { getApps, initializeApp, applicationDefault, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let cachedApp: App | undefined;
let cachedDb: Firestore | undefined;
let cachedBucket: ReturnType<ReturnType<typeof getStorage>["bucket"]> | undefined;

function getApp(): App {
  if (cachedApp) return cachedApp;

  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return existing;
  }

  // Local dev only: if GOOGLE_APPLICATION_CREDENTIALS_JSON is set (e.g. from
  // a locally-downloaded key you keep OUT of git), use it. In every deployed
  // environment this branch is skipped and Application Default Credentials
  // (the Cloud Run runtime service account) are used instead.
  const localKey = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  cachedApp = initializeApp({
    credential: localKey ? cert(JSON.parse(localKey)) : applicationDefault(),
    storageBucket: process.env.GCS_BUCKET,
  });
  return cachedApp;
}

export function getDb(): Firestore {
  if (!cachedDb) cachedDb = getFirestore(getApp());
  return cachedDb;
}

export function getMediaBucket() {
  if (!cachedBucket) cachedBucket = getStorage(getApp()).bucket();
  return cachedBucket;
}

// Collection name constants in one place so a rename is a one-line change.
// Plain string constants — no GCP call, safe to export eagerly.
export const COLLECTIONS = {
  episodes: "episodes",
  guests: "guests",
  resources: "resources",
  topics: "topics",
  settings: "settings",
  auditLog: "auditLog",
} as const;

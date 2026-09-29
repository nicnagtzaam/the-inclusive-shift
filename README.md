# The Inclusive Shift — application scaffold

This is a working scaffold of the architecture agreed in the infra brief:
Next.js on Cloud Run, Firestore for content, Cloud Storage for media,
Identity-Aware Proxy for admin auth, Firebase Hosting + CDN at the edge
(no Cloud Load Balancer/Cloud Armor for v1 — see the cost note below).

**What's real here**: the data models, validation, Firestore access patterns,
API routes (with auth, rate limiting, validation, audit logging, and cache
revalidation wired up), security headers, Firestore/Storage rules, the
Dockerfile, and the CI/CD pipeline. These are functioning, not placeholders.

**What's a stub, deliberately**: the actual page markup. Every public and
admin page fetches real data and renders it as plain unstyled HTML. Turning
this into the pixel-accurate approved Figma design is separate front-end
work — this scaffold's job is to get the *architecture* right first.

## 1. Local setup
```
npm install
gcloud auth application-default login   # so firebase-admin can reach Firestore
cp .env.example .env.local
npm run dev
```

## 2. GCP project setup (one-time, per Section 39)
- Create a dedicated GCP project — do not reuse a personal/shared one.
- Enable: Cloud Run, Firestore (Native mode), Cloud Storage, Secret Manager,
  Identity-Aware Proxy, Cloud Scheduler, Artifact Registry.
- Create THREE service accounts, least-privilege each:
  - `runtime-sa`: `roles/datastore.user`, `roles/storage.objectAdmin` (scoped
    to the media bucket only). This is what Cloud Run runs as.
  - `deploy-sa`: `roles/run.developer`, `roles/iam.serviceAccountUser`. Used
    only by GitHub Actions via Workload Identity Federation — no key file.
  - `backup-runner-sa`: `roles/datastore.importExportAdmin`. Used only by the
    Cloud Scheduler job in `scripts/README.md`.
- Never use the `Owner` role for day-to-day work (Section 39).

## 3. Admin auth (IAP) setup
1. Deploy the Cloud Run service with `--no-allow-unauthenticated` (already
   set in the CI workflow).
2. Enable Identity-Aware Proxy on the Cloud Run service.
3. Grant `roles/iap.httpsResourceAccessor` to the owner's Google account (and
   later, any editor) — this is the entire authorisation step. No app code
   changes needed to add a second admin.
4. Add each authorised email to `ROLE_MAP` in `lib/auth.ts` to map them to
   `ADMIN` or `EDITOR`.

This replaces building custom login/MFA/session handling — Google's own
login (with whatever MFA/passkey policy your Workspace enforces) protects
`/admin/*` before any request reaches this application.

## 4. Why no Cloud Load Balancer / Cloud Armor in v1
A Global External Application Load Balancer bills a flat ~$0.025/hour
(~$18/month) for the forwarding rule alone, regardless of traffic, and Cloud
Armor is a separate paid add-on on top of that. For a single-admin site with
no user accounts, that's a guaranteed monthly cost for a threat model this
site doesn't really have — the real risks (auth, input validation, CSRF,
rate limiting) are already covered in the application layer. Firebase
Hosting gives CDN + managed TLS in front of Cloud Run for free. Revisit
Cloud Armor only if you see real attack traffic in Cloud Run's logs — add it
then, not pre-emptively.

## 5. Media uploads
Not yet scaffolded: the actual upload flow. The intended pattern (per
Section 25) is: admin requests a signed Cloud Storage upload URL from a
`/api/uploads` route (checks auth + file size/MIME up front), uploads
directly to Cloud Storage from the browser, then the file signature is
re-validated server-side once uploaded before the episode/guest record
references it.

## 6. Publishing workflow
`POST /api/episodes` → draft. Editing via `PATCH /api/episodes/:id`.
`POST /api/episodes/:id/publish` flips status to `published`, sets
`publishedAt`, and revalidates the homepage, episode list, episode detail
page, and sitemap — so publishing is visible immediately without waiting for
the hourly safety-net revalidation.

## 7. Promotion pack
`GET /api/promotion-pack/:episodeId` (admin-only) returns editable
LinkedIn/Instagram/short/guest-message copy per Section 48. Purely
template-based — no AI, no auto-posting. The admin UI for copy-to-clipboard
buttons isn't built yet.

## 8. Backups & disaster recovery
See `scripts/README.md` for the Firestore export schedule. Document (and
periodically test) recovery per Section 37: app rollback is `gcloud run
services update-traffic --to-revisions=PREVIOUS=100`; Firestore restore is
`gcloud firestore import`.

## 9. What's genuinely NOT built yet
- Guests/Resources/Topics admin edit UI (only list + episode new/edit exist)
- Media upload flow
- Sitemap generation
- Application-level search (Section 42 — plain Firestore queries are enough
  at 20-500 episodes; don't add a search service)
- Cost budget alerts (GCP console config, not code — Section 46)
- Pixel-accurate implementation of the approved Figma design

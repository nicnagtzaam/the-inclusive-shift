# Scheduled Firestore export (Section 36)

Firestore does NOT back itself up automatically — this has to be configured.
Two options, both scheduled, both independent of the application running:

## Option A — gcloud scheduled export (simplest, recommended for this scale)
1. Create a Cloud Storage bucket for backups (separate from the media bucket,
   with a lifecycle rule to delete exports older than ~90 days).
2. Create a Cloud Scheduler job that calls the Firestore export API daily:

   gcloud scheduler jobs create http firestore-daily-backup \
     --schedule="0 3 * * *" \
     --uri="https://firestore.googleapis.com/v1/projects/PROJECT_ID/databases/(default):exportDocuments" \
     --message-body='{"outputUriPrefix":"gs://the-inclusive-shift-backups"}' \
     --oauth-service-account-email=BACKUP_RUNNER_SA@PROJECT_ID.iam.gserviceaccount.com

3. The BACKUP_RUNNER_SA needs only `roles/datastore.importExportAdmin` — not
   a broad role.

## Restoring
   gcloud firestore import gs://the-inclusive-shift-backups/EXPORT_FOLDER

Test this restore process at least once before you need it for real
(Section 37 — disaster recovery must be documented AND verified, not just
written down).

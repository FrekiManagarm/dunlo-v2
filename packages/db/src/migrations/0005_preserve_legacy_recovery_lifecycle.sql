ALTER TYPE "public"."connection_phase" ADD VALUE IF NOT EXISTS 'recovery_confirming';--> statement-breakpoint
ALTER TABLE "diagnostic_snapshot" ADD COLUMN IF NOT EXISTS "original_currency_totals" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "stripe_connection"
SET "phase" = 'recovery_active'
WHERE "phase" = 'diagnosing'
  AND (
    "scope" = 'read_write'
    OR "webhook_endpoint_id" IS NOT NULL
    OR "recovery_activated_at" IS NOT NULL
  );

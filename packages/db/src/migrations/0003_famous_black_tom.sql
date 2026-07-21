ALTER TABLE "diagnostic_run" ADD COLUMN "lease_owner_id" text;--> statement-breakpoint
UPDATE "diagnostic_run" SET "lease_owner_id" = "id" WHERE "lease_owner_id" IS NULL;--> statement-breakpoint
ALTER TABLE "diagnostic_run" ALTER COLUMN "lease_owner_id" SET NOT NULL;

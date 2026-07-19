ALTER TABLE "diagnostic_run" ADD COLUMN "lease_expires_at" timestamp;--> statement-breakpoint
UPDATE "diagnostic_run" SET "lease_expires_at" = "updated_at" WHERE "lease_expires_at" IS NULL;--> statement-breakpoint
ALTER TABLE "diagnostic_run" ALTER COLUMN "lease_expires_at" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "diagnostic_run_lease_expires_at_idx" ON "diagnostic_run" USING btree ("lease_expires_at");

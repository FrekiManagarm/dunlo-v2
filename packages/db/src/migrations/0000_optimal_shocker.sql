CREATE TYPE "public"."connection_phase" AS ENUM('diagnosing', 'diagnostic_ready', 'monitoring', 'activation_requested', 'write_authorized', 'email_configured', 'recovery_active', 'disconnecting', 'disconnect_failed');--> statement-breakpoint
ALTER TABLE "stripe_connection" ALTER COLUMN "webhook_secret" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_connection" ALTER COLUMN "scope" SET DEFAULT 'read_only';--> statement-breakpoint
ALTER TABLE "stripe_connection" ADD COLUMN "phase" "connection_phase" DEFAULT 'diagnosing' NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_connection" ADD COLUMN "monitoring_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_connection" ADD COLUMN "last_analyzed_at" timestamp;--> statement-breakpoint
ALTER TABLE "stripe_connection" ADD COLUMN "next_analysis_at" timestamp;--> statement-breakpoint
ALTER TABLE "stripe_connection" ADD COLUMN "live_mode" boolean;--> statement-breakpoint
CREATE TABLE "diagnostic_snapshot" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"user_id" text NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"status" text NOT NULL,
	"verdict" text NOT NULL,
	"analysis_starts_at" timestamp NOT NULL,
	"analysis_ends_at" timestamp NOT NULL,
	"decision_starts_at" timestamp NOT NULL,
	"decision_ends_at" timestamp NOT NULL,
	"decision_window_complete" boolean NOT NULL,
	"pages_loaded" integer DEFAULT 0 NOT NULL,
	"records_loaded" integer DEFAULT 0 NOT NULL,
	"coverage_complete" boolean NOT NULL,
	"stale_at" timestamp,
	"fixed_mrr" integer DEFAULT 0 NOT NULL,
	"variable_mrr" integer DEFAULT 0 NOT NULL,
	"limited_confidence_mrr" integer DEFAULT 0 NOT NULL,
	"excluded_mrr" integer DEFAULT 0 NOT NULL,
	"dominant_currency" text NOT NULL,
	"dominant_currency_share_bps" integer DEFAULT 0 NOT NULL,
	"observed_failed" integer DEFAULT 0 NOT NULL,
	"naturally_recovered" integer DEFAULT 0 NOT NULL,
	"open_automatable" integer DEFAULT 0 NOT NULL,
	"open_human" integer DEFAULT 0 NOT NULL,
	"historically_lost_automatable" integer DEFAULT 0 NOT NULL,
	"historically_lost_human" integer DEFAULT 0 NOT NULL,
	"excluded_amount" integer DEFAULT 0 NOT NULL,
	"monthly_addressable" integer DEFAULT 0 NOT NULL,
	"addressable_now" integer DEFAULT 0 NOT NULL,
	"plan_code" text NOT NULL,
	"plan_price_usd" integer DEFAULT 0 NOT NULL,
	"break_even_usd" integer DEFAULT 0 NOT NULL,
	"classifier_version" text NOT NULL,
	"qualification_version" text NOT NULL,
	"fx_source" text NOT NULL,
	"fx_series_keys" jsonb NOT NULL,
	"fx_rate_date" date NOT NULL,
	"fx_fetched_at" timestamp NOT NULL,
	"fx_rate_to_usd" numeric(20, 10) NOT NULL,
	"failure_category" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagnostic_finding" (
	"id" text PRIMARY KEY NOT NULL,
	"snapshot_id" text NOT NULL,
	"connection_id" text NOT NULL,
	"stripe_invoice_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"failed_at" timestamp NOT NULL,
	"resolved_at" timestamp,
	"invoice_status" text NOT NULL,
	"subscription_status" text,
	"advice_code" text,
	"decline_code" text,
	"category" text NOT NULL,
	"reason" text NOT NULL,
	"classifier_version" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diagnostic_snapshot" ADD CONSTRAINT "diagnostic_snapshot_connection_id_stripe_connection_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."stripe_connection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_snapshot" ADD CONSTRAINT "diagnostic_snapshot_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_finding" ADD CONSTRAINT "diagnostic_finding_snapshot_id_diagnostic_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."diagnostic_snapshot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_finding" ADD CONSTRAINT "diagnostic_finding_connection_id_stripe_connection_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."stripe_connection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stripe_connection_phase_idx" ON "stripe_connection" USING btree ("phase");--> statement-breakpoint
CREATE INDEX "stripe_connection_next_analysis_at_idx" ON "stripe_connection" USING btree ("next_analysis_at");--> statement-breakpoint
CREATE UNIQUE INDEX "diagnostic_snapshot_current_connection_unique" ON "diagnostic_snapshot" USING btree ("connection_id") WHERE "diagnostic_snapshot"."is_current" = true;--> statement-breakpoint
CREATE INDEX "diagnostic_snapshot_user_id_idx" ON "diagnostic_snapshot" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "diagnostic_snapshot_connection_id_idx" ON "diagnostic_snapshot" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "diagnostic_snapshot_created_at_idx" ON "diagnostic_snapshot" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "diagnostic_finding_snapshot_id_idx" ON "diagnostic_finding" USING btree ("snapshot_id");--> statement-breakpoint
CREATE INDEX "diagnostic_finding_connection_id_idx" ON "diagnostic_finding" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "diagnostic_finding_created_at_idx" ON "diagnostic_finding" USING btree ("created_at");

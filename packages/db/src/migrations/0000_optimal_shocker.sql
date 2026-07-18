CREATE TYPE "public"."connection_phase" AS ENUM('diagnosing', 'diagnostic_ready', 'monitoring', 'activation_requested', 'write_authorized', 'email_configured', 'recovery_active', 'disconnecting', 'disconnect_failed');--> statement-breakpoint
CREATE TYPE "public"."escalation_status" AS ENUM('pending', 'sent', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."failed_payment_status" AS ENUM('in_recovery', 'recovered', 'escalated', 'failed', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."processor" AS ENUM('stripe', 'paddle', 'adyen', 'mollie', 'mangopay');--> statement-breakpoint
CREATE TYPE "public"."recovery_attempt_status" AS ENUM('scheduled', 'sent', 'failed', 'dismissed');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "benchmark_snapshot" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"stripe_account_id" text,
	"sample_starts_at" timestamp NOT NULL,
	"sample_ends_at" timestamp NOT NULL,
	"total_charge_count" integer DEFAULT 0 NOT NULL,
	"failed_charge_count" integer DEFAULT 0 NOT NULL,
	"recovered_failure_count" integer DEFAULT 0 NOT NULL,
	"failed_payment_rate_bps" integer DEFAULT 0 NOT NULL,
	"recovery_rate_bps" integer DEFAULT 0 NOT NULL,
	"card_expired_rate_bps" integer DEFAULT 0 NOT NULL,
	"insufficient_funds_rate_bps" integer DEFAULT 0 NOT NULL,
	"do_not_honor_rate_bps" integer DEFAULT 0 NOT NULL,
	"card_velocity_exceeded_rate_bps" integer DEFAULT 0 NOT NULL,
	"other_rate_bps" integer DEFAULT 0 NOT NULL,
	"mrr_range" text DEFAULT 'unknown' NOT NULL,
	"benchmark_opt_out" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "benchmark_snapshot_user_id_unique" UNIQUE("user_id")
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
CREATE TABLE "email_provider" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text DEFAULT 'resend' NOT NULL,
	"api_key" text NOT NULL,
	"domain" text,
	"from_email" text NOT NULL,
	"from_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_provider_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "escalation" (
	"id" text PRIMARY KEY NOT NULL,
	"failed_payment_id" text NOT NULL,
	"user_id" text NOT NULL,
	"draft_subject" text,
	"draft_body" text,
	"status" "escalation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "escalation_failed_payment_id_unique" UNIQUE("failed_payment_id")
);
--> statement-breakpoint
CREATE TABLE "failed_payment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"stripe_payment_intent_id" text NOT NULL,
	"stripe_account_id" text,
	"stripe_customer_id" text NOT NULL,
	"stripe_invoice_id" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'eur' NOT NULL,
	"failure_code" text NOT NULL,
	"failure_message" text,
	"customer_name" text,
	"customer_email" text NOT NULL,
	"last_four" text,
	"description" text,
	"status" "failed_payment_status" DEFAULT 'in_recovery' NOT NULL,
	"recovered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "failed_payment_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email_on_failure" boolean DEFAULT true NOT NULL,
	"email_on_recovery" boolean DEFAULT true NOT NULL,
	"email_on_escalation" boolean DEFAULT true NOT NULL,
	"email_on_email_sent" boolean DEFAULT false NOT NULL,
	"slack_on_failure" boolean DEFAULT false NOT NULL,
	"slack_on_recovery" boolean DEFAULT false NOT NULL,
	"slack_on_escalation" boolean DEFAULT true NOT NULL,
	"slack_on_email_sent" boolean DEFAULT false NOT NULL,
	"slack_webhook_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "recovery_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"failed_payment_id" text NOT NULL,
	"sequence_step_id" text NOT NULL,
	"status" "recovery_attempt_status" DEFAULT 'scheduled' NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"sent_at" timestamp,
	"resend_email_id" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recovery_sequence" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"failure_code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sequence_step" (
	"id" text PRIMARY KEY NOT NULL,
	"sequence_id" text NOT NULL,
	"step_number" integer NOT NULL,
	"delay_hours" integer DEFAULT 0 NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_connection" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"stripe_account_id" text NOT NULL,
	"access_token" text NOT NULL,
	"publishable_key" text,
	"webhook_endpoint_id" text,
	"webhook_secret" text,
	"scope" text DEFAULT 'read_only' NOT NULL,
	"phase" "connection_phase" DEFAULT 'diagnosing' NOT NULL,
	"monitoring_enabled" boolean DEFAULT false NOT NULL,
	"last_analyzed_at" timestamp,
	"next_analysis_at" timestamp,
	"live_mode" boolean,
	"escalation_threshold" integer DEFAULT 50000,
	"escalation_currency" text DEFAULT 'eur' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stripe_connection_stripe_account_id_unique" UNIQUE("stripe_account_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmark_snapshot" ADD CONSTRAINT "benchmark_snapshot_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_finding" ADD CONSTRAINT "diagnostic_finding_snapshot_id_diagnostic_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."diagnostic_snapshot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_finding" ADD CONSTRAINT "diagnostic_finding_connection_id_stripe_connection_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."stripe_connection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_snapshot" ADD CONSTRAINT "diagnostic_snapshot_connection_id_stripe_connection_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."stripe_connection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_snapshot" ADD CONSTRAINT "diagnostic_snapshot_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_provider" ADD CONSTRAINT "email_provider_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalation" ADD CONSTRAINT "escalation_failed_payment_id_failed_payment_id_fk" FOREIGN KEY ("failed_payment_id") REFERENCES "public"."failed_payment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalation" ADD CONSTRAINT "escalation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "failed_payment" ADD CONSTRAINT "failed_payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_attempt" ADD CONSTRAINT "recovery_attempt_failed_payment_id_failed_payment_id_fk" FOREIGN KEY ("failed_payment_id") REFERENCES "public"."failed_payment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_attempt" ADD CONSTRAINT "recovery_attempt_sequence_step_id_sequence_step_id_fk" FOREIGN KEY ("sequence_step_id") REFERENCES "public"."sequence_step"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_sequence" ADD CONSTRAINT "recovery_sequence_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequence_step" ADD CONSTRAINT "sequence_step_sequence_id_recovery_sequence_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."recovery_sequence"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_connection" ADD CONSTRAINT "stripe_connection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "benchmark_snapshot_user_id_idx" ON "benchmark_snapshot" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "benchmark_snapshot_stripe_account_id_idx" ON "benchmark_snapshot" USING btree ("stripe_account_id");--> statement-breakpoint
CREATE INDEX "benchmark_snapshot_opt_out_idx" ON "benchmark_snapshot" USING btree ("benchmark_opt_out");--> statement-breakpoint
CREATE INDEX "benchmark_snapshot_updated_at_idx" ON "benchmark_snapshot" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "diagnostic_finding_snapshot_id_idx" ON "diagnostic_finding" USING btree ("snapshot_id");--> statement-breakpoint
CREATE INDEX "diagnostic_finding_connection_id_idx" ON "diagnostic_finding" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "diagnostic_finding_created_at_idx" ON "diagnostic_finding" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "diagnostic_snapshot_current_connection_unique" ON "diagnostic_snapshot" USING btree ("connection_id") WHERE "diagnostic_snapshot"."is_current" = true;--> statement-breakpoint
CREATE INDEX "diagnostic_snapshot_user_id_idx" ON "diagnostic_snapshot" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "diagnostic_snapshot_connection_id_idx" ON "diagnostic_snapshot" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "diagnostic_snapshot_created_at_idx" ON "diagnostic_snapshot" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_provider_user_id_idx" ON "email_provider" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "escalation_user_id_idx" ON "escalation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "failed_payment_user_id_idx" ON "failed_payment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "failed_payment_stripe_account_id_idx" ON "failed_payment" USING btree ("stripe_account_id");--> statement-breakpoint
CREATE INDEX "failed_payment_status_idx" ON "failed_payment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "failed_payment_created_at_idx" ON "failed_payment" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notification_settings_user_id_idx" ON "notification_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recovery_attempt_status_scheduled_at_idx" ON "recovery_attempt" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "recovery_attempt_failed_payment_id_idx" ON "recovery_attempt" USING btree ("failed_payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recovery_sequence_user_failure_unique" ON "recovery_sequence" USING btree ("user_id","failure_code");--> statement-breakpoint
CREATE INDEX "recovery_sequence_user_id_idx" ON "recovery_sequence" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sequence_step_sequence_id_idx" ON "sequence_step" USING btree ("sequence_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sequence_step_sequence_step_unique" ON "sequence_step" USING btree ("sequence_id","step_number");--> statement-breakpoint
CREATE INDEX "stripe_connection_user_id_idx" ON "stripe_connection" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "stripe_connection_stripe_account_id_idx" ON "stripe_connection" USING btree ("stripe_account_id");--> statement-breakpoint
CREATE INDEX "stripe_connection_phase_idx" ON "stripe_connection" USING btree ("phase");--> statement-breakpoint
CREATE INDEX "stripe_connection_next_analysis_at_idx" ON "stripe_connection" USING btree ("next_analysis_at");
CREATE TABLE "diagnostic_run" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"analysis_starts_at" timestamp NOT NULL,
	"analysis_ends_at" timestamp NOT NULL,
	"status" text NOT NULL,
	"checkpoints" jsonb NOT NULL,
	"error_category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diagnostic_run" ADD CONSTRAINT "diagnostic_run_connection_id_stripe_connection_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."stripe_connection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "diagnostic_run_connection_window_unique" ON "diagnostic_run" USING btree ("connection_id","analysis_starts_at","analysis_ends_at");--> statement-breakpoint
CREATE INDEX "diagnostic_run_connection_updated_at_idx" ON "diagnostic_run" USING btree ("connection_id","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "diagnostic_snapshot_connection_window_unique" ON "diagnostic_snapshot" USING btree ("connection_id","analysis_starts_at","analysis_ends_at");
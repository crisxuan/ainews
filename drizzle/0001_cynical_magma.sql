CREATE TABLE "radar_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"mode" text NOT NULL,
	"status" text NOT NULL,
	"model" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"topics_found" integer DEFAULT 0 NOT NULL,
	"topics_written" integer DEFAULT 0 NOT NULL,
	"openai_response_id" text,
	"error" text
);
--> statement-breakpoint
CREATE INDEX "radar_runs_started_idx" ON "radar_runs" USING btree ("started_at");
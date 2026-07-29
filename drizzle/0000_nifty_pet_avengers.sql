CREATE TABLE "breaking_items" (
	"id" text PRIMARY KEY NOT NULL,
	"detected_at" timestamp with time zone NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"heat" text NOT NULL,
	"signal" text NOT NULL,
	"summary" text NOT NULL,
	"why" text NOT NULL,
	"source_count" integer NOT NULL,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"discussion_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"link" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "briefing_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"briefing_id" text NOT NULL,
	"position" integer NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"heat" text NOT NULL,
	"signal" text NOT NULL,
	"summary" text,
	"why" text,
	"community" text,
	"editorial" text,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"discussion_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"link" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "briefings" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"date_label" text NOT NULL,
	"weekday" text NOT NULL,
	"edition" text NOT NULL,
	"published_at" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radar_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"cadence_minutes" integer NOT NULL,
	"cooldown_hours" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "briefing_topics" ADD CONSTRAINT "briefing_topics_briefing_id_briefings_id_fk" FOREIGN KEY ("briefing_id") REFERENCES "public"."briefings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "breaking_items_detected_idx" ON "breaking_items" USING btree ("detected_at");--> statement-breakpoint
CREATE UNIQUE INDEX "briefing_topics_briefing_position_idx" ON "briefing_topics" USING btree ("briefing_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "briefings_date_edition_idx" ON "briefings" USING btree ("date","edition");--> statement-breakpoint
CREATE INDEX "briefings_published_idx" ON "briefings" USING btree ("date","published_at");
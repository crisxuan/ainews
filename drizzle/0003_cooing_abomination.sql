CREATE TABLE "breaking_item_links" (
	"url" text PRIMARY KEY NOT NULL,
	"breaking_item_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "breaking_item_links" ADD CONSTRAINT "breaking_item_links_breaking_item_id_breaking_items_id_fk" FOREIGN KEY ("breaking_item_id") REFERENCES "public"."breaking_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "breaking_item_links_item_idx" ON "breaking_item_links" USING btree ("breaking_item_id");
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export type DiscussionLink = {
  platform: string;
  url: string;
  title?: string;
  engagement?: string;
};

export const briefings = pgTable(
  "briefings",
  {
    id: text("id").primaryKey(),
    date: text("date").notNull(),
    dateLabel: text("date_label").notNull(),
    weekday: text("weekday").notNull(),
    edition: text("edition").notNull(),
    publishedAt: text("published_at").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("briefings_date_edition_idx").on(table.date, table.edition),
    index("briefings_published_idx").on(table.date, table.publishedAt),
  ],
);

export const briefingTopics = pgTable(
  "briefing_topics",
  {
    id: text("id").primaryKey(),
    briefingId: text("briefing_id")
      .notNull()
      .references(() => briefings.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    heat: text("heat").notNull(),
    signal: text("signal").notNull(),
    summary: text("summary"),
    why: text("why"),
    community: text("community"),
    editorial: text("editorial"),
    sources: jsonb("sources").$type<string[]>().notNull().default([]),
    discussionLinks: jsonb("discussion_links")
      .$type<DiscussionLink[]>()
      .notNull()
      .default([]),
    link: text("link").notNull(),
  },
  (table) => [
    uniqueIndex("briefing_topics_briefing_position_idx").on(
      table.briefingId,
      table.position,
    ),
  ],
);

export const radarSettings = pgTable("radar_settings", {
  id: text("id").primaryKey(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  cadenceMinutes: integer("cadence_minutes").notNull(),
  cooldownHours: integer("cooldown_hours").notNull(),
});

export const breakingItems = pgTable(
  "breaking_items",
  {
    id: text("id").primaryKey(),
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    heat: text("heat").notNull(),
    signal: text("signal").notNull(),
    summary: text("summary").notNull(),
    why: text("why").notNull(),
    sourceCount: integer("source_count").notNull(),
    sources: jsonb("sources").$type<string[]>().notNull().default([]),
    discussionLinks: jsonb("discussion_links")
      .$type<DiscussionLink[]>()
      .notNull()
      .default([]),
    link: text("link").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("breaking_items_detected_idx").on(table.detectedAt),
    uniqueIndex("breaking_items_link_idx").on(table.link),
  ],
);

export const breakingItemLinks = pgTable(
  "breaking_item_links",
  {
    url: text("url").primaryKey(),
    breakingItemId: text("breaking_item_id")
      .notNull()
      .references(() => breakingItems.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("breaking_item_links_item_idx").on(table.breakingItemId)],
);

export const radarRuns = pgTable(
  "radar_runs",
  {
    id: text("id").primaryKey(),
    mode: text("mode").notNull(),
    status: text("status").notNull(),
    model: text("model").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    topicsFound: integer("topics_found").notNull().default(0),
    topicsWritten: integer("topics_written").notNull().default(0),
    openaiResponseId: text("openai_response_id"),
    error: text("error"),
  },
  (table) => [index("radar_runs_started_idx").on(table.startedAt)],
);

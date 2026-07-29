import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const projectRoot = resolve(import.meta.dirname, "..");
const localEnvPath = resolve(projectRoot, ".env.local");

if (!process.env.DATABASE_URL && existsSync(localEnvPath)) {
  loadEnvFile(localEnvPath);
}

let sqlClient;

function getSql() {
  if (!process.env.DATABASE_URL) return null;
  sqlClient ??= neon(process.env.DATABASE_URL);
  return sqlClient;
}

export async function upsertBriefing(issue) {
  const sql = getSql();
  if (!sql) return false;

  await sql.query(
    `INSERT INTO briefings (
      id, date, date_label, weekday, edition, published_at, title, summary, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    ON CONFLICT (id) DO UPDATE SET
      date = EXCLUDED.date,
      date_label = EXCLUDED.date_label,
      weekday = EXCLUDED.weekday,
      edition = EXCLUDED.edition,
      published_at = EXCLUDED.published_at,
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      updated_at = NOW()`,
    [
      issue.id,
      issue.date,
      issue.dateLabel,
      issue.weekday,
      issue.edition,
      issue.publishedAt,
      issue.title,
      issue.summary,
    ],
  );

  await sql.query("DELETE FROM briefing_topics WHERE briefing_id = $1", [issue.id]);
  for (const [index, topic] of issue.topics.entries()) {
    await sql.query(
      `INSERT INTO briefing_topics (
        id, briefing_id, position, title, category, heat, signal,
        summary, why, community, editorial, sources, discussion_links, link
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14
      )`,
      [
        `${issue.id}-${index + 1}`,
        issue.id,
        index + 1,
        topic.title,
        topic.category,
        topic.heat,
        topic.signal,
        topic.summary ?? null,
        topic.why ?? null,
        topic.community ?? null,
        topic.editorial ?? null,
        JSON.stringify(topic.sources ?? []),
        JSON.stringify(topic.discussionLinks ?? []),
        topic.link,
      ],
    );
  }

  return true;
}

export async function upsertBreakingFeed(feed) {
  const sql = getSql();
  if (!sql) return false;

  await sql.query(
    `INSERT INTO radar_settings (
      id, updated_at, cadence_minutes, cooldown_hours
    ) VALUES ('default', $1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET
      updated_at = EXCLUDED.updated_at,
      cadence_minutes = EXCLUDED.cadence_minutes,
      cooldown_hours = EXCLUDED.cooldown_hours`,
    [feed.updatedAt, feed.cadenceMinutes, feed.cooldownHours],
  );

  for (const item of feed.items) {
    await sql.query(
      `INSERT INTO breaking_items (
        id, detected_at, title, category, heat, signal, summary, why,
        source_count, sources, discussion_links, link, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10::jsonb, $11::jsonb, $12, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        detected_at = EXCLUDED.detected_at,
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        heat = EXCLUDED.heat,
        signal = EXCLUDED.signal,
        summary = EXCLUDED.summary,
        why = EXCLUDED.why,
        source_count = EXCLUDED.source_count,
        sources = EXCLUDED.sources,
        discussion_links = EXCLUDED.discussion_links,
        link = EXCLUDED.link,
        updated_at = NOW()`,
      [
        item.id,
        item.detectedAt,
        item.title,
        item.category,
        item.heat,
        item.signal,
        item.summary,
        item.why,
        item.sourceCount,
        JSON.stringify(item.sources ?? []),
        JSON.stringify(item.discussionLinks ?? []),
        item.link,
      ],
    );
  }

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  await sql.query("DELETE FROM breaking_items WHERE detected_at < $1", [cutoff]);
  return true;
}

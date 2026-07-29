import { asc, desc } from "drizzle-orm";
import { getDb } from ".";
import {
  briefingTopics,
  briefings,
  breakingItems,
  radarSettings,
} from "./schema";

export async function getHomepageFeed() {
  const db = getDb();
  const [issueRows, topicRows, breakingRows, settingsRows] = await Promise.all([
    db
      .select()
      .from(briefings)
      .orderBy(desc(briefings.date), desc(briefings.publishedAt)),
    db
      .select()
      .from(briefingTopics)
      .orderBy(asc(briefingTopics.briefingId), asc(briefingTopics.position)),
    db
      .select()
      .from(breakingItems)
      .orderBy(desc(breakingItems.detectedAt))
      .limit(20),
    db.select().from(radarSettings).limit(1),
  ]);

  const topicsByBriefing = new Map<string, typeof topicRows>();
  for (const topic of topicRows) {
    const topics = topicsByBriefing.get(topic.briefingId) ?? [];
    topics.push(topic);
    topicsByBriefing.set(topic.briefingId, topics);
  }

  const archiveIssues = issueRows.map((issue) => ({
    id: issue.id,
    date: issue.date,
    dateLabel: issue.dateLabel,
    weekday: issue.weekday,
    edition: issue.edition,
    publishedAt: issue.publishedAt,
    title: issue.title,
    summary: issue.summary,
    topics: (topicsByBriefing.get(issue.id) ?? []).map((topic) => ({
      title: topic.title,
      category: topic.category,
      heat: topic.heat,
      signal: topic.signal,
      summary: topic.summary ?? undefined,
      why: topic.why ?? undefined,
      community: topic.community ?? undefined,
      editorial: topic.editorial ?? undefined,
      sources: topic.sources,
      discussionLinks: topic.discussionLinks,
      link: topic.link,
    })),
  }));

  const settings = settingsRows[0];
  const breakingFeed = {
    updatedAt:
      settings?.updatedAt.toISOString() ??
      breakingRows[0]?.updatedAt.toISOString() ??
      new Date(0).toISOString(),
    cadenceMinutes: settings?.cadenceMinutes ?? 60,
    cooldownHours: settings?.cooldownHours ?? 6,
    items: breakingRows.map((item) => ({
      id: item.id,
      detectedAt: item.detectedAt.toISOString(),
      title: item.title,
      category: item.category,
      heat: item.heat,
      signal: item.signal,
      summary: item.summary,
      why: item.why,
      sourceCount: item.sourceCount,
      sources: item.sources,
      discussionLinks: item.discussionLinks,
      link: item.link,
    })),
  };

  return { archiveIssues, breakingFeed };
}

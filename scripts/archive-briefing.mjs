import { readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { upsertBriefing } from "./database.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const archivePath = resolve(projectRoot, "data/briefings.json");

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function validateDiscussionLinks(value) {
  if (value === undefined) return null;
  if (!Array.isArray(value) || value.length > 4) {
    return "discussionLinks 必须是最多 4 条的数组";
  }
  for (const link of value) {
    if (!link?.platform || !link?.url) {
      return "每条 discussionLinks 都需要 platform 和 url";
    }
    try {
      const url = new URL(link.url);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("invalid protocol");
    } catch {
      return "discussionLinks.url 必须是有效的 HTTP(S) 链接";
    }
  }
  return null;
}

function validateIssue(issue) {
  if (!issue || typeof issue !== "object") return "简报必须是 JSON 对象";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(issue.date ?? "")) return "date 必须使用 YYYY-MM-DD";
  if (!['morning', 'evening'].includes(issue.edition)) return "edition 必须是 morning 或 evening";
  if (!issue.weekday || !issue.title || !issue.summary) return "简报需要 weekday、title 和 summary";
  if (!Array.isArray(issue.topics) || issue.topics.length === 0) return "topics 至少需要一条热点";
  for (const topic of issue.topics) {
    if (!topic.title || !topic.category || !topic.heat || !topic.signal || !topic.link) {
      return "每条 topic 都需要 title、category、heat、signal 和 link";
    }
    if (!topic.summary || !topic.why || !topic.community || !topic.editorial || !Array.isArray(topic.sources)) {
      return "每条 topic 都需要 summary、why、community、editorial 和 sources";
    }
    const discussionError = validateDiscussionLinks(topic.discussionLinks);
    if (discussionError) return `${topic.title}: ${discussionError}`;
  }
  return null;
}

const inputIndex = process.argv.indexOf("--input");
if (process.argv.includes("--help")) {
  console.log("用法: node scripts/archive-briefing.mjs --input <briefing.json>");
} else if (inputIndex === -1 || !process.argv[inputIndex + 1]) {
  fail("缺少 --input <briefing.json>");
} else {
  try {
    const inputPath = resolve(process.cwd(), process.argv[inputIndex + 1]);
    const issue = JSON.parse(await readFile(inputPath, "utf8"));
    const error = validateIssue(issue);
    if (error) throw new Error(error);

    issue.id = `${issue.date}-${issue.edition}`;
    issue.publishedAt ||= issue.edition === "morning" ? "08:00" : "20:00";
    issue.dateLabel ||= issue.date.slice(5).replace("-", ".");

    const archive = JSON.parse(await readFile(archivePath, "utf8"));
    const next = archive.filter((item) => item.id !== issue.id);
    next.push(issue);
    next.sort((a, b) =>
      `${b.date}T${b.publishedAt}`.localeCompare(`${a.date}T${a.publishedAt}`),
    );

    const temporaryPath = `${archivePath}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    await rename(temporaryPath, archivePath);
    const databaseUpdated = await upsertBriefing(issue);
    console.log(
      `已归档 ${issue.id}，共 ${next.length} 期${databaseUpdated ? "，并同步到 Neon" : ""}。`,
    );
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

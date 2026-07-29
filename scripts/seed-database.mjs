import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { upsertBriefing, upsertBreakingFeed } from "./database.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const archive = JSON.parse(
  await readFile(resolve(projectRoot, "data/briefings.json"), "utf8"),
);
const breakingFeed = JSON.parse(
  await readFile(resolve(projectRoot, "data/breaking.json"), "utf8"),
);

for (const issue of archive) {
  await upsertBriefing(issue);
}
await upsertBreakingFeed(breakingFeed);

const retentionMs = 48 * 60 * 60 * 1000;
const activeBreakingCount = breakingFeed.items.filter(
  (item) => Date.now() - Date.parse(item.detectedAt) <= retentionMs,
).length;

console.log(
  `Neon 数据库已写入 ${archive.length} 期简报和 ${activeBreakingCount} 条有效准实时热点。`,
);

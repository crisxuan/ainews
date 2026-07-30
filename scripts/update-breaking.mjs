import { readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { upsertBreakingFeed } from "./database.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const feedPath = resolve(projectRoot, "data/breaking.json");
const allowedCategories = new Set(["模型", "开放生态", "基础设施", "社会情绪"]);
const allowedHeat = new Set(["高", "中"]);
const allowedSignals = new Set(["突发热点", "快速升温", "重要更新"]);
const retentionMs = 48 * 60 * 60 * 1000;

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function normalizeTitle(value) {
  return value.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");
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

function validateItem(item) {
  if (!item || typeof item !== "object") return "突发热点必须是 JSON 对象";
  if (!item.id || !item.detectedAt || !item.title || !item.summary || !item.why || !item.link) {
    return "每条突发热点都需要 id、detectedAt、title、summary、why 和 link";
  }
  if (Number.isNaN(Date.parse(item.detectedAt))) return "detectedAt 必须是有效的 ISO 时间";
  if (!allowedCategories.has(item.category)) return "category 不在允许范围内";
  if (!allowedHeat.has(item.heat)) return "heat 只能是高或中";
  if (!allowedSignals.has(item.signal)) return "signal 必须是突发热点、快速升温或重要更新";
  if (!Number.isInteger(item.sourceCount) || item.sourceCount < 2) return "sourceCount 必须至少为 2";
  if (!Array.isArray(item.sources) || item.sources.length < 2) return "sources 至少需要 2 个独立来源";
  const discussionError = validateDiscussionLinks(item.discussionLinks);
  if (discussionError) return discussionError;
  return null;
}

const inputIndex = process.argv.indexOf("--input");
const pruneOnly = process.argv.includes("--prune");
if (process.argv.includes("--help")) {
  console.log("用法: node scripts/update-breaking.mjs --input <breaking.json> | --prune");
} else if (pruneOnly) {
  try {
    const feed = JSON.parse(await readFile(feedPath, "utf8"));
    const activeItems = feed.items.filter(
      (item) => Date.now() - Date.parse(item.detectedAt) <= retentionMs,
    );
    const nextFeed = {
      ...feed,
      updatedAt: new Date().toISOString(),
      items: activeItems,
    };
    if (activeItems.length === feed.items.length) {
      console.log("没有过期的准实时热点，网站数据未变化。");
    } else {
      const temporaryPath = `${feedPath}.tmp`;
      await writeFile(
        temporaryPath,
        `${JSON.stringify(nextFeed, null, 2)}\n`,
        "utf8",
      );
      await rename(temporaryPath, feedPath);
      console.log(`已清理 ${feed.items.length - activeItems.length} 条过期热点。`);
    }
    const databaseUpdated = await upsertBreakingFeed(nextFeed);
    console.log(databaseUpdated ? "准实时热点已同步到 Neon。" : "准实时热点未同步到 Neon。");
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
} else if (inputIndex === -1 || !process.argv[inputIndex + 1]) {
  fail("缺少 --input <breaking.json>");
} else {
  try {
    const inputPath = resolve(process.cwd(), process.argv[inputIndex + 1]);
    const input = JSON.parse(await readFile(inputPath, "utf8"));
    const incoming = Array.isArray(input) ? input : input.items;
    if (!Array.isArray(incoming) || incoming.length === 0) {
      throw new Error("输入需要包含至少一条 items");
    }

    for (const item of incoming) {
      const error = validateItem(item);
      if (error) throw new Error(`${item?.title ?? "未知热点"}: ${error}`);
    }

    const feed = JSON.parse(await readFile(feedPath, "utf8"));
    const now = Math.max(Date.now(), ...incoming.map((item) => Date.parse(item.detectedAt)));
    const activeItems = feed.items.filter(
      (item) => now - Date.parse(item.detectedAt) <= retentionMs,
    );
    let accepted = 0;

    for (const item of incoming) {
      const duplicateIndex = activeItems.findIndex(
        (existing) => existing.id === item.id || normalizeTitle(existing.title) === normalizeTitle(item.title),
      );

      if (duplicateIndex >= 0) {
        const existing = activeItems[duplicateIndex];
        const withinCooldown =
          Date.parse(item.detectedAt) - Date.parse(existing.detectedAt) < feed.cooldownHours * 60 * 60 * 1000;
        if (withinCooldown && item.materialUpdate !== true) continue;
        activeItems.splice(duplicateIndex, 1);
      }

      const publicItem = { ...item };
      delete publicItem.materialUpdate;
      activeItems.push(publicItem);
      accepted += 1;
    }

    if (accepted === 0) {
      console.log("所有热点都处于去重冷却期，网站数据未变化。");
    } else {
      activeItems.sort((a, b) => Date.parse(b.detectedAt) - Date.parse(a.detectedAt));
      const nextFeed = {
        ...feed,
        updatedAt: new Date(now).toISOString(),
        items: activeItems.slice(0, 20),
      };
      const temporaryPath = `${feedPath}.tmp`;
      await writeFile(temporaryPath, `${JSON.stringify(nextFeed, null, 2)}\n`, "utf8");
      await rename(temporaryPath, feedPath);
      const databaseUpdated = await upsertBreakingFeed(nextFeed);
      console.log(
        `已更新 ${accepted} 条准实时热点，当前保留 ${nextFeed.items.length} 条${databaseUpdated ? "，并同步到 Neon" : ""}。`,
      );
    }
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

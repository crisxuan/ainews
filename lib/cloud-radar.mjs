import { neon } from "@neondatabase/serverless";

export const SHANGHAI_TIME_ZONE = "Asia/Shanghai";
export const HOURLY_MODEL = "openai/gpt-5-mini";
export const BRIEFING_MODEL = "openai/gpt-5-mini";

const FEED_SOURCES = [
  ["OpenAI News", "https://openai.com/news/rss.xml", "official"],
  ["Anthropic Research", "https://www.anthropic.com/research/rss.xml", "official"],
  ["Anthropic News", "https://www.anthropic.com/news/rss.xml", "official"],
  ["Google DeepMind Blog", "https://deepmind.google/discover/blog/rss.xml", "official"],
  ["Microsoft Research", "https://www.microsoft.com/en-us/research/feed/", "official"],
  ["NVIDIA Technical Blog", "https://developer.nvidia.com/blog/feed/", "official"],
  ["Hugging Face Papers", "https://huggingface.co/papers/rss", "official"],
  ["arXiv cs.AI", "https://export.arxiv.org/rss/cs.AI", "official"],
  ["arXiv cs.LG", "https://export.arxiv.org/rss/cs.LG", "official"],
  ["arXiv cs.CL", "https://export.arxiv.org/rss/cs.CL", "official"],
  ["arXiv cs.CV", "https://export.arxiv.org/rss/cs.CV", "official"],
  ["Papers with Code", "https://paperswithcode.com/rss", "official"],
  ["Stanford HAI", "https://hai.stanford.edu/rss.xml", "official"],
  ["Berkeley BAIR", "https://bair.berkeley.edu/blog/feed.xml", "official"],
  ["TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/", "editorial"],
  ["MIT Technology Review AI", "https://www.technologyreview.com/topic/artificial-intelligence/feed/", "editorial"],
  ["The Verge AI", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "editorial"],
  ["Ars Technica AI", "https://arstechnica.com/tag/artificial-intelligence/feed/", "editorial"],
  ["VentureBeat AI", "https://venturebeat.com/category/ai/feed/", "editorial"],
  ["The Batch", "https://www.deeplearning.ai/the-batch/feed/", "editorial"],
  ["Latent Space", "https://www.latent.space/feed", "editorial"],
  ["SemiAnalysis", "https://www.semianalysis.com/feed", "editorial"],
  ["QbitAI", "https://www.qbitai.com/feed", "editorial"],
  ["BAAI Hub", "https://hub.baai.ac.cn/rss", "editorial"],
  ["YouTube · OpenAI", "https://www.youtube.com/feeds/videos.xml?channel_id=UCXZCJLdBC09xxGZ6gcdrc6A", "official"],
  ["YouTube · Anthropic", "https://www.youtube.com/feeds/videos.xml?channel_id=UCrDwWp7EBBv4NwvScIpBDOA", "official"],
  ["YouTube · Google DeepMind", "https://www.youtube.com/feeds/videos.xml?channel_id=UCP7jMXSY2xbc3KCAE0MHQ-A", "official"],
  ["YouTube · Hugging Face", "https://www.youtube.com/feeds/videos.xml?channel_id=UCHlNU7kIZhRgSbhHvFoy72w", "official"],
  ["YouTube · DeepLearning.AI", "https://www.youtube.com/feeds/videos.xml?channel_id=UCcIXc5mJsHVYTZR1maL5l9w", "official"],
];

export const ALLOWED_DOMAINS = [
  "openai.com",
  "anthropic.com",
  "deepmind.google",
  "ai.meta.com",
  "microsoft.com",
  "nvidia.com",
  "huggingface.co",
  "arxiv.org",
  "paperswithcode.com",
  "stanford.edu",
  "berkeley.edu",
  "techcrunch.com",
  "technologyreview.com",
  "theverge.com",
  "arstechnica.com",
  "venturebeat.com",
  "deeplearning.ai",
  "latent.space",
  "semianalysis.com",
  "qbitai.com",
  "baai.ac.cn",
  "youtube.com",
  "youtu.be",
  "reddit.com",
  "news.ycombinator.com",
  "digg.com",
  "github.com",
  "polymarket.com",
  "x.com",
  "tiktok.com",
  "instagram.com",
];

const DISCUSSION_DOMAINS = new Set([
  "youtube.com",
  "youtu.be",
  "reddit.com",
  "news.ycombinator.com",
  "digg.com",
  "github.com",
  "polymarket.com",
  "x.com",
  "tiktok.com",
  "instagram.com",
]);

const CATEGORY_VALUES = ["模型", "开放生态", "基础设施", "社会情绪"];
const HEAT_VALUES = ["高", "中", "观察中"];
const SIGNAL_VALUES = [
  "突发热点",
  "快速升温",
  "重要更新",
  "已形成热点",
  "社区先热",
  "官方先发",
  "单点信号",
  "持续追踪",
];

const evidenceSchema = {
  type: "object",
  properties: {
    label: { type: "string" },
    url: { type: "string" },
    kind: { type: "string", enum: ["official", "editorial", "community"] },
  },
  required: ["label", "url", "kind"],
  additionalProperties: false,
};

const discussionSchema = {
  type: "object",
  properties: {
    platform: { type: "string" },
    url: { type: "string" },
    title: { type: "string" },
    engagement: { type: "string" },
  },
  required: ["platform", "url", "title", "engagement"],
  additionalProperties: false,
};

const topicSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    entity: { type: "string" },
    title: { type: "string" },
    category: { type: "string", enum: CATEGORY_VALUES },
    heat: { type: "string", enum: HEAT_VALUES },
    signal: { type: "string", enum: SIGNAL_VALUES },
    summary: { type: "string" },
    why: { type: "string" },
    community: { type: "string" },
    editorial: { type: "string" },
    evidence: { type: "array", items: evidenceSchema, maxItems: 8 },
    discussionLinks: { type: "array", items: discussionSchema, maxItems: 4 },
    link: { type: "string" },
    materialUpdate: { type: "boolean" },
  },
  required: [
    "id",
    "entity",
    "title",
    "category",
    "heat",
    "signal",
    "summary",
    "why",
    "community",
    "editorial",
    "evidence",
    "discussionLinks",
    "link",
    "materialUpdate",
  ],
  additionalProperties: false,
};

export const radarOutputSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    topics: { type: "array", items: topicSchema, maxItems: 5 },
    successfulSources: { type: "array", items: { type: "string" }, maxItems: 30 },
    failedSources: { type: "array", items: { type: "string" }, maxItems: 30 },
  },
  required: ["title", "summary", "topics", "successfulSources", "failedSources"],
  additionalProperties: false,
};

export function shanghaiClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHANGHAI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value ?? "";
  const weekdayMap = {
    Mon: "周一",
    Tue: "周二",
    Wed: "周三",
    Thu: "周四",
    Fri: "周五",
    Sat: "周六",
    Sun: "周日",
  };
  const dateValue = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = Number(get("hour"));
  return {
    date: dateValue,
    dateLabel: `${get("month")}.${get("day")}`,
    weekday: weekdayMap[get("weekday")] ?? get("weekday"),
    hour,
    minute: Number(get("minute")),
    isoLabel: `${dateValue} ${String(hour).padStart(2, "0")}:${get("minute")} Asia/Shanghai`,
  };
}

export function selectMode(clock, forcedMode) {
  if (["hourly", "morning", "evening"].includes(forcedMode)) return forcedMode;
  if (clock.hour === 8) return "morning";
  if (clock.hour === 20) return "evening";
  return "hourly";
}

export function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|ref$|ref_|source$|campaign$)/i.test(key)) url.searchParams.delete(key);
    }
    if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/$/, "");
    return url.toString();
  } catch {
    return "";
  }
}

export function hostnameFor(value) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function matchingDomain(hostname) {
  return ALLOWED_DOMAINS.find(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}

export function isAllowedUrl(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) return false;
  const url = new URL(normalized);
  return url.protocol === "https:" && Boolean(matchingDomain(hostnameFor(normalized)));
}

export function independentSourceKey(value) {
  const hostname = hostnameFor(value);
  return matchingDomain(hostname) ?? hostname;
}

export function collectRetrievedUrls(response) {
  const found = new Set();
  const visit = (value) => {
    if (!value) return;
    if (typeof value === "string") {
      if (/^https:\/\//i.test(value)) found.add(normalizeUrl(value));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if (key === "url" && typeof child === "string") {
          const normalized = normalizeUrl(child);
          if (normalized) found.add(normalized);
        } else {
          visit(child);
        }
      }
    }
  };
  visit(response?.output ?? []);
  return found;
}

function urlWasRetrieved(value, retrievedUrls) {
  const normalized = normalizeUrl(value);
  if (!normalized || !isAllowedUrl(normalized)) return false;
  if (!retrievedUrls.size) return false;
  if (retrievedUrls.has(normalized)) return true;
  const candidate = new URL(normalized);
  return [...retrievedUrls].some((retrieved) => {
    const source = new URL(retrieved);
    return (
      source.hostname === candidate.hostname &&
      source.pathname.replace(/\/$/, "") === candidate.pathname.replace(/\/$/, "") &&
      (!candidate.search || source.search === candidate.search)
    );
  });
}

function safeSlug(value) {
  const slug = String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
  return slug || `topic-${Date.now()}`;
}

function uniqueStrings(values, limit = 8) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))].slice(0, limit);
}

function decodeXml(value) {
  return String(value ?? "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function tagText(block, names) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i"));
    if (match) return decodeXml(match[1]);
  }
  return "";
}

export function parseFeed(xml, source, kind) {
  const blocks = [...String(xml).matchAll(/<(item|entry)\b[^>]*>[\s\S]*?<\/\1>/gi)];
  return blocks.slice(0, 20).flatMap((match) => {
    const block = match[0];
    const title = tagText(block, ["title"]);
    const atomLink = block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/i)?.[1];
    const link = decodeXml(atomLink || tagText(block, ["link", "guid", "id"]));
    const published = tagText(block, ["pubDate", "published", "updated", "dc:date", "date"]);
    if (!title || !isAllowedUrl(link)) return [];
    return [
      {
        source,
        title,
        url: normalizeUrl(link),
        published,
        kind,
        engagement: "",
        discussionUrl: "",
      },
    ];
  });
}

async function fetchText(url, accept = "application/rss+xml, application/atom+xml, application/xml, text/xml") {
  const response = await fetch(url, {
    headers: {
      Accept: accept,
      "User-Agent": "ai-fengxiang-cloud-radar/1.0 (+https://ai-fengxiang.vercel.app)",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

function isFresh(value, cutoffMs) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp >= cutoffMs && timestamp <= Date.now() + 60 * 60 * 1000;
}

async function collectFeeds(cutoffMs) {
  const settled = await Promise.allSettled(
    FEED_SOURCES.map(async ([source, url, kind]) => ({
      source,
      candidates: parseFeed(await fetchText(url), source, kind).filter((item) => isFresh(item.published, cutoffMs)),
    })),
  );
  const candidates = [];
  const successfulSources = [];
  const failedSources = [];
  settled.forEach((result, index) => {
    const source = FEED_SOURCES[index][0];
    if (result.status === "fulfilled") {
      candidates.push(...result.value.candidates);
      successfulSources.push(source);
    } else {
      failedSources.push(`${source}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`);
    }
  });
  return { candidates, successfulSources, failedSources };
}

async function collectHackerNews(cutoffMs) {
  const queries = ["AI", "OpenAI", "Anthropic", "LLM"];
  const results = await Promise.allSettled(
    queries.map(async (query) => {
      const endpoint = new URL("https://hn.algolia.com/api/v1/search_by_date");
      endpoint.searchParams.set("tags", "story");
      endpoint.searchParams.set("query", query);
      endpoint.searchParams.set("hitsPerPage", "40");
      endpoint.searchParams.set("numericFilters", `created_at_i>${Math.floor(cutoffMs / 1000)}`);
      return JSON.parse(await fetchText(endpoint, "application/json")).hits ?? [];
    }),
  );
  const hits = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  const seen = new Set();
  const candidates = [];
  for (const hit of hits) {
    if (seen.has(hit.objectID)) continue;
    seen.add(hit.objectID);
    const discussionUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;
    const articleUrl = hit.url && isAllowedUrl(hit.url) ? normalizeUrl(hit.url) : discussionUrl;
    candidates.push({
      source: "Hacker News",
      title: String(hit.title || hit.story_title || "").trim(),
      url: articleUrl,
      published: hit.created_at,
      kind: "community",
      engagement: `${Number(hit.points || 0)} points · ${Number(hit.num_comments || 0)} comments`,
      discussionUrl,
    });
  }
  return {
    candidates,
    successfulSources: results.some((result) => result.status === "fulfilled") ? ["Hacker News"] : [],
    failedSources: results.every((result) => result.status === "rejected") ? ["Hacker News: all queries failed"] : [],
  };
}

async function collectReddit(cutoffMs) {
  const endpoint = new URL("https://www.reddit.com/search.json");
  endpoint.searchParams.set("q", "OpenAI OR Anthropic OR LLM OR artificial intelligence");
  endpoint.searchParams.set("sort", "new");
  endpoint.searchParams.set("t", "day");
  endpoint.searchParams.set("limit", "75");
  endpoint.searchParams.set("raw_json", "1");
  try {
    const payload = JSON.parse(await fetchText(endpoint, "application/json"));
    const candidates = (payload?.data?.children ?? []).flatMap(({ data }) => {
      if (!data?.title || Number(data.created_utc) * 1000 < cutoffMs) return [];
      const discussionUrl = normalizeUrl(`https://www.reddit.com${data.permalink}`);
      const articleUrl = data.url && isAllowedUrl(data.url) ? normalizeUrl(data.url) : discussionUrl;
      return [{
        source: `Reddit · r/${data.subreddit}`,
        title: String(data.title).trim(),
        url: articleUrl,
        published: new Date(Number(data.created_utc) * 1000).toISOString(),
        kind: "community",
        engagement: `${Number(data.score || 0)} points · ${Number(data.num_comments || 0)} comments`,
        discussionUrl,
      }];
    });
    return { candidates, successfulSources: ["Reddit"], failedSources: [] };
  } catch (error) {
    return { candidates: [], successfulSources: [], failedSources: [`Reddit: ${error instanceof Error ? error.message : String(error)}`] };
  }
}

async function collectGitHub(cutoffMs) {
  const since = new Date(cutoffMs).toISOString().slice(0, 10);
  const endpoint = new URL("https://api.github.com/search/repositories");
  endpoint.searchParams.set("q", `topic:artificial-intelligence pushed:>=${since}`);
  endpoint.searchParams.set("sort", "stars");
  endpoint.searchParams.set("order", "desc");
  endpoint.searchParams.set("per_page", "25");
  try {
    const payload = JSON.parse(await fetchText(endpoint, "application/vnd.github+json"));
    const candidates = (payload.items ?? []).map((item) => ({
      source: "GitHub",
      title: `${item.full_name}: ${item.description || "AI repository update"}`,
      url: normalizeUrl(item.html_url),
      published: item.pushed_at,
      kind: "community",
      engagement: `${Number(item.stargazers_count || 0)} stars`,
      discussionUrl: normalizeUrl(item.html_url),
    }));
    return { candidates, successfulSources: ["GitHub"], failedSources: [] };
  } catch (error) {
    return { candidates: [], successfulSources: [], failedSources: [`GitHub: ${error instanceof Error ? error.message : String(error)}`] };
  }
}

export async function collectCloudCandidates(mode, now = new Date()) {
  const hours = mode === "hourly" ? 24 : 12;
  const cutoffMs = now.getTime() - hours * 60 * 60 * 1000;
  const lanes = await Promise.all([
    collectFeeds(cutoffMs),
    collectHackerNews(cutoffMs),
    collectReddit(cutoffMs),
    collectGitHub(cutoffMs),
  ]);
  const byUrl = new Map();
  for (const candidate of lanes.flatMap((lane) => lane.candidates)) {
    if (!candidate.title || !isFresh(candidate.published, cutoffMs)) continue;
    const key = `${normalizeUrl(candidate.url)}|${normalizeUrl(candidate.discussionUrl)}`;
    if (!byUrl.has(key)) byUrl.set(key, candidate);
  }
  const sorted = [...byUrl.values()].sort(
    (a, b) => Date.parse(b.published) - Date.parse(a.published),
  );
  const primary = sorted.filter((candidate) => candidate.kind !== "community");
  const community = sorted.filter((candidate) => candidate.kind === "community");
  const limit = mode === "hourly" ? 160 : 220;
  return {
    // Keep official/editorial lanes intact before filling the remaining budget
    // with higher-volume community candidates.
    candidates: [...primary, ...community.slice(0, Math.max(0, limit - primary.length))],
    successfulSources: uniqueStrings(lanes.flatMap((lane) => lane.successfulSources), 50),
    failedSources: uniqueStrings(lanes.flatMap((lane) => lane.failedSources), 50),
  };
}

const GENERIC_ENTITY_TOKENS = new Set([
  "artificial",
  "intelligence",
  "model",
  "models",
  "agent",
  "agents",
  "agentic",
  "framework",
  "frameworks",
  "open",
  "source",
  "release",
  "update",
]);

function entityTokens(value) {
  return String(value ?? "")
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9._-]{2,}|[\p{Script=Han}]{2,}/gu)
    ?.filter((token) => !GENERIC_ENTITY_TOKENS.has(token)) ?? [];
}

function candidateIndex(candidates) {
  const index = new Map();
  for (const candidate of candidates ?? []) {
    for (const url of [candidate.url, candidate.discussionUrl]) {
      const normalized = normalizeUrl(url);
      if (normalized) index.set(normalized, candidate);
    }
  }
  return index;
}

function evidenceMatchesEntity(evidence, entity, candidatesByUrl) {
  const tokens = entityTokens(entity);
  if (!tokens.length) return false;
  const candidate = candidatesByUrl.get(normalizeUrl(evidence.url));
  if (!candidate) return false;
  const haystack = `${candidate.title} ${candidate.url}`.toLowerCase();
  return tokens.some((token) => haystack.includes(token));
}

export function sanitizeTopics(result, mode, retrievedUrls, candidates = []) {
  const topics = Array.isArray(result?.topics) ? result.topics : [];
  const candidatesByUrl = candidateIndex(candidates);
  const allowedSignals =
    mode === "hourly"
      ? new Set(["突发热点", "快速升温", "重要更新"])
      : new Set(["已形成热点", "社区先热", "官方先发", "单点信号", "持续追踪"]);

  return topics.flatMap((topic) => {
    if (
      !topic?.title ||
      !CATEGORY_VALUES.includes(topic.category) ||
      !HEAT_VALUES.includes(topic.heat) ||
      !allowedSignals.has(topic.signal)
    ) {
      return [];
    }

    const evidence = (Array.isArray(topic.evidence) ? topic.evidence : [])
      .filter((item) => item?.label && urlWasRetrieved(item.url, retrievedUrls))
      .map((item) => ({
        label: String(item.label).trim(),
        url: normalizeUrl(item.url),
        kind: item.kind,
      }));
    const distinctSources = new Set(evidence.map((item) => independentSourceKey(item.url)));
    if ((mode === "hourly" && distinctSources.size < 2) || evidence.length === 0) return [];
    if (
      mode === "hourly" &&
      !evidence.every((item) => evidenceMatchesEntity(item, topic.entity, candidatesByUrl))
    ) {
      return [];
    }

    const discussionLinks = (Array.isArray(topic.discussionLinks) ? topic.discussionLinks : [])
      .filter((item) => {
        const domain = independentSourceKey(item?.url);
        return item?.platform && DISCUSSION_DOMAINS.has(domain) && urlWasRetrieved(item.url, retrievedUrls);
      })
      .map((item) => ({
        platform: String(item.platform).trim(),
        url: normalizeUrl(item.url),
        ...(item.title ? { title: String(item.title).trim() } : {}),
        ...(item.engagement ? { engagement: String(item.engagement).trim() } : {}),
      }))
      .slice(0, 4);

    const preferredLink = urlWasRetrieved(topic.link, retrievedUrls)
      ? normalizeUrl(topic.link)
      : evidence[0].url;
    const sources = uniqueStrings(
      evidence.map((item) => {
        const label = String(item.label).trim();
        return label.length <= 40 ? label : candidatesByUrl.get(item.url)?.source || label.slice(0, 40);
      }),
      4,
    );
    return [
      {
        id: safeSlug(topic.id || topic.title),
        title: String(topic.title).trim(),
        category: topic.category,
        heat: topic.heat,
        signal: topic.signal,
        summary: String(topic.summary ?? "").trim(),
        why: String(topic.why ?? "").trim(),
        community: String(topic.community ?? "覆盖不足").trim(),
        editorial: String(topic.editorial ?? sources.join(" · ")).trim(),
        sourceCount: distinctSources.size,
        sources,
        discussionLinks,
        link: preferredLink,
        materialUpdate: topic.materialUpdate === true,
      },
    ];
  });
}

function buildPrompt({ mode, clock, recentContext, collected }) {
  const common = `你是“AI 风向标”的云端热点编辑。当前时间：${clock.isoLabel}。

目标：从最近的真实网页证据中发现值得推送的 AI 事件，按“同一实体 + 同一事件”聚类，并输出中文结构化结果。

证据约束：
- 只能使用下面“本轮云端采集候选”里的 URL，不得依靠模型记忆补链接或猜测链接。
- 只接受白名单官方/编辑来源与 Reddit、Hacker News、Digg、YouTube、GitHub、Polymarket、X、TikTok、Instagram 的直接页面。
- 转载、聚合和同稿不同 URL 只算一个独立来源；同一平台重复帖子不能虚增来源数。
- The Information、CAAI、Aiera、机器之心不在监控范围内。
- 没有足够证据时返回空 topics，宁缺毋滥。
- discussionLinks 只能放可直接打开的原始讨论帖、评论串、视频或 issue，不能放搜索结果页。
- id 使用稳定、简短的英文 slug。同一事件再次出现时沿用已有 id。
- entity 必须是这个具体事件的核心实体名称（公司、模型或项目名），不能写“AI”“智能体框架”“开源模型”等泛化类别。
- evidence.label 只写简短来源名，例如 OpenAI、The Verge、Hacker News，不要写报道摘要。

近期已发布内容（用于去重，不要机械复述）：
${JSON.stringify(recentContext)}

本轮云端采集候选：
${JSON.stringify(collected.candidates)}
`;

  if (mode === "hourly") {
    return `${common}
这是每小时准实时轻扫。只看最近 24 小时，最多返回 2 个主题。每个主题必须满足至少一个条件：
1. 至少 2 个真正独立来源确认；
2. Hacker News 至少 250 分或 120 评论；
3. Reddit 至少 500 分或 150 评论；
4. 相比既有事件出现新的官方事实、独立来源至少增加 2 个，或互动量再次至少翻倍。

普通单篇文章、低互动帖子、只换标题的重复事件都返回空 topics。heat 只能为“高”或“中”；signal 只能为“突发热点”“快速升温”“重要更新”。title 与 summary 要陈述事实，why 给出简洁判断。
普通整点禁止输出行业趋势、同类项目拼盘或把不同实体的新闻合并成一个主题。每条 evidence 的候选标题都必须明确包含同一个 entity；做不到就删除该主题。`;
  }

  const edition = mode === "morning" ? "上午" : "晚间";
  return `${common}
这是 12 小时半日简报，标题使用“AI ${edition}联合热点”的语气，最多返回 5 个主题。优先：官方发布且已有社区/技术反应；多来源共同升温；重要官方发布；最后才考虑单一编辑来源。不得让论文批量更新淹没产品、研究或产业事件。

heat 使用“高”“中”“观察中”；signal 使用“已形成热点”“社区先热”“官方先发”“单点信号”“持续追踪”。每个主题必须有 summary、why、community、editorial。没有可靠信号时可返回空 topics，并在 summary 说明。`;
}

function outputText(response) {
  for (const item of response?.output ?? []) {
    if (item?.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content?.type === "output_text" && content.text) return content.text;
    }
  }
  throw new Error("OpenAI response did not contain output_text");
}

export async function runOpenAIRadar({ gatewayToken, mode, clock, recentContext, collected }) {
  const model =
    mode === "hourly"
      ? process.env.OPENAI_RADAR_MODEL || HOURLY_MODEL
      : process.env.OPENAI_BRIEFING_MODEL || BRIEFING_MODEL;
  const response = await fetch("https://ai-gateway.vercel.sh/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${gatewayToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: mode === "hourly" ? "low" : "medium" },
      instructions: buildPrompt({ mode, clock, recentContext, collected }),
      input: "执行本期 AI 热点扫描，并严格按 JSON Schema 返回结果。",
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "ai_radar_result",
          strict: true,
          schema: radarOutputSchema,
        },
      },
      store: false,
      max_output_tokens: mode === "hourly" ? 5000 : 9000,
    }),
    signal: AbortSignal.timeout(mode === "hourly" ? 240_000 : 540_000),
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || `OpenAI request failed with ${response.status}`;
    throw new Error(message);
  }
  const parsed = JSON.parse(outputText(payload));
  const retrievedUrls = new Set(
    collected.candidates.flatMap((candidate) => [candidate.url, candidate.discussionUrl]).filter(Boolean).map(normalizeUrl),
  );
  const topics = sanitizeTopics(parsed, mode, retrievedUrls, collected.candidates);
  return {
    model,
    responseId: payload.id,
    title: String(parsed.title ?? "").trim(),
    summary: String(parsed.summary ?? "").trim(),
    topics,
    successfulSources: collected.successfulSources,
    failedSources: collected.failedSources,
    retrievedUrlCount: retrievedUrls.size,
  };
}

export function createDatabase(databaseUrl) {
  const sql = neon(databaseUrl);

  return {
    async startRun({ id, mode, model, startedAt }) {
      await sql.query(
        `INSERT INTO radar_runs (id, mode, status, model, started_at)
         VALUES ($1, $2, 'running', $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           mode = EXCLUDED.mode,
           status = 'running',
           model = EXCLUDED.model,
           started_at = EXCLUDED.started_at,
           finished_at = NULL,
           error = NULL`,
        [id, mode, model, startedAt],
      );
    },

    async finishRun({ id, status, found, written, responseId, error = null }) {
      await sql.query(
        `UPDATE radar_runs SET
           status = $2,
           topics_found = $3,
           topics_written = $4,
           openai_response_id = $5,
           error = $6,
           finished_at = NOW()
         WHERE id = $1`,
        [id, status, found, written, responseId, error],
      );
    },

    async recentRuns(limit = 24) {
      return sql.query(
        `SELECT id, mode, status, model, started_at, finished_at,
                topics_found, topics_written, openai_response_id, error
         FROM radar_runs ORDER BY started_at DESC LIMIT $1`,
        [limit],
      );
    },

    async recentContext() {
      const [breaking, briefings] = await Promise.all([
        sql.query(
          `SELECT id, title, detected_at, source_count, sources, updated_at
           FROM breaking_items
           WHERE detected_at >= NOW() - INTERVAL '48 hours'
           ORDER BY detected_at DESC LIMIT 20`,
        ),
        sql.query(
          `SELECT b.id, b.date, b.edition, bt.title
           FROM briefings b
           JOIN briefing_topics bt ON bt.briefing_id = b.id
           ORDER BY b.date DESC, b.published_at DESC, bt.position ASC
           LIMIT 15`,
        ),
      ]);
      return { breaking, briefings };
    },

    async writeBreaking(topics, detectedAt) {
      let written = 0;
      for (const topic of topics) {
        const previous = await sql.query(
          `SELECT id, detected_at, source_count FROM breaking_items WHERE id = $1 LIMIT 1`,
          [topic.id],
        );
        const existing = previous[0];
        const withinCooldown =
          existing &&
          new Date(detectedAt).getTime() - new Date(existing.detected_at).getTime() < 6 * 60 * 60 * 1000;
        const substantialSourceGrowth =
          existing && topic.sourceCount >= Number(existing.source_count ?? 0) + 2;
        if (withinCooldown && !(topic.materialUpdate && substantialSourceGrowth)) continue;

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
            topic.id,
            detectedAt,
            topic.title,
            topic.category,
            topic.heat,
            topic.signal,
            topic.summary,
            topic.why,
            topic.sourceCount,
            JSON.stringify(topic.sources),
            JSON.stringify(topic.discussionLinks),
            topic.link,
          ],
        );
        written += 1;
      }
      await Promise.all([
        sql.query(`DELETE FROM breaking_items WHERE detected_at < NOW() - INTERVAL '48 hours'`),
        sql.query(
          `INSERT INTO radar_settings (id, updated_at, cadence_minutes, cooldown_hours)
           VALUES ('default', NOW(), 60, 6)
           ON CONFLICT (id) DO UPDATE SET updated_at = NOW(), cadence_minutes = 60, cooldown_hours = 6`,
        ),
      ]);
      return written;
    },

    async writeBriefing({ mode, clock, title, summary, topics }) {
      if (!topics.length) return 0;
      const id = `${clock.date}-${mode}`;
      const publishedAt = mode === "morning" ? "08:00" : "20:00";
      await sql.query(
        `INSERT INTO briefings (
           id, date, date_label, weekday, edition, published_at, title, summary, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           summary = EXCLUDED.summary,
           updated_at = NOW()`,
        [id, clock.date, clock.dateLabel, clock.weekday, mode, publishedAt, title, summary],
      );
      await sql.query("DELETE FROM briefing_topics WHERE briefing_id = $1", [id]);
      for (const [index, topic] of topics.entries()) {
        await sql.query(
          `INSERT INTO briefing_topics (
             id, briefing_id, position, title, category, heat, signal,
             summary, why, community, editorial, sources, discussion_links, link
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7,
             $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14
           )`,
          [
            `${id}-${index + 1}`,
            id,
            index + 1,
            topic.title,
            topic.category,
            topic.heat,
            topic.signal,
            topic.summary,
            topic.why,
            topic.community,
            topic.editorial,
            JSON.stringify(topic.sources),
            JSON.stringify(topic.discussionLinks),
            topic.link,
          ],
        );
      }
      return topics.length;
    },
  };
}

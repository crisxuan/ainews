import assert from "node:assert/strict";
import test from "node:test";
import {
  collectRetrievedUrls,
  independentSourceKey,
  isAllowedUrl,
  normalizeUrl,
  parseFeed,
  sanitizeTopics,
  selectMode,
  shanghaiClock,
} from "../lib/cloud-radar.mjs";

test("selects Shanghai briefing hours and supports an explicit mode", () => {
  const morning = shanghaiClock(new Date("2026-08-04T00:00:00Z"));
  const evening = shanghaiClock(new Date("2026-08-04T12:00:00Z"));
  assert.equal(morning.hour, 8);
  assert.equal(morning.weekday, "周二");
  assert.equal(selectMode(morning), "morning");
  assert.equal(selectMode(evening), "evening");
  assert.equal(selectMode(evening, "hourly"), "hourly");
});

test("parses fresh RSS and Atom entries into traceable candidates", () => {
  const rss = `<?xml version="1.0"?><rss><channel><item><title><![CDATA[New &amp; useful]]></title><link>https://openai.com/index/new</link><pubDate>Tue, 04 Aug 2026 01:00:00 GMT</pubDate></item></channel></rss>`;
  const atom = `<feed><entry><title>Video update</title><link rel="alternate" href="https://www.youtube.com/watch?v=abc"/><published>2026-08-04T01:00:00Z</published></entry></feed>`;
  assert.deepEqual(parseFeed(rss, "OpenAI", "official")[0], {
    source: "OpenAI",
    title: "New & useful",
    url: "https://openai.com/index/new",
    published: "Tue, 04 Aug 2026 01:00:00 GMT",
    kind: "official",
    engagement: "",
    discussionUrl: "",
  });
  assert.equal(parseFeed(atom, "YouTube", "official")[0].url, "https://www.youtube.com/watch?v=abc");
});

test("allows only monitored HTTPS domains and normalizes tracking parameters", () => {
  assert.equal(isAllowedUrl("https://openai.com/index/example"), true);
  assert.equal(isAllowedUrl("https://news.ycombinator.com/item?id=123"), true);
  assert.equal(isAllowedUrl("http://openai.com/index/example"), false);
  assert.equal(isAllowedUrl("https://example.com/fake"), false);
  assert.equal(
    normalizeUrl("https://openai.com/index/example/?utm_source=test&keep=yes#part"),
    "https://openai.com/index/example?keep=yes",
  );
  assert.equal(independentSourceKey("https://www.reddit.com/r/LocalLLaMA/"), "reddit.com");
});

test("collects retrieved URLs and rejects unsupported or single-source hourly topics", () => {
  const response = {
    output: [
      {
        type: "web_search_call",
        action: {
          sources: [
            { url: "https://openai.com/index/new-model" },
            { url: "https://news.ycombinator.com/item?id=42" },
          ],
        },
      },
    ],
  };
  const retrieved = collectRetrievedUrls(response);
  const base = {
    id: "new-model",
    entity: "OpenAI",
    title: "OpenAI 发布新模型",
    category: "模型",
    heat: "高",
    signal: "突发热点",
    summary: "官方发布了新模型。",
    why: "产品能力出现实质变化。",
    community: "Hacker News 正在讨论。",
    editorial: "OpenAI · Hacker News",
    evidence: [
      { label: "OpenAI", url: "https://openai.com/index/new-model", kind: "official" },
      {
        label: "Hacker News",
        url: "https://news.ycombinator.com/item?id=42",
        kind: "community",
      },
      { label: "Fake", url: "https://example.com/fake", kind: "editorial" },
    ],
    discussionLinks: [
      {
        platform: "Hacker News",
        url: "https://news.ycombinator.com/item?id=42",
        title: "Discussion",
        engagement: "300 points",
      },
    ],
    link: "https://openai.com/index/new-model",
    materialUpdate: false,
  };
  const candidates = [
    { title: "OpenAI launches a new model", url: "https://openai.com/index/new-model" },
    {
      title: "OpenAI launches a new model",
      url: "https://openai.com/index/new-model",
      discussionUrl: "https://news.ycombinator.com/item?id=42",
    },
  ];
  const accepted = sanitizeTopics({ topics: [base] }, "hourly", retrieved, candidates);
  assert.equal(accepted.length, 1);
  assert.equal(accepted[0].sourceCount, 2);
  assert.deepEqual(accepted[0].sources, ["OpenAI", "Hacker News"]);
  assert.equal(accepted[0].discussionLinks.length, 1);

  const rejected = sanitizeTopics(
    { topics: [{ ...base, evidence: [base.evidence[0]] }] },
    "hourly",
    retrieved,
    candidates,
  );
  assert.deepEqual(rejected, []);

  const mixedEntities = sanitizeTopics(
    {
      topics: [
        {
          ...base,
          entity: "OpenAI",
          evidence: [
            base.evidence[0],
            {
              label: "Hacker News",
              url: "https://news.ycombinator.com/item?id=42",
              kind: "community",
            },
          ],
        },
      ],
    },
    "hourly",
    retrieved,
    [
      candidates[0],
      {
        title: "A different Anthropic release",
        url: "https://news.ycombinator.com/item?id=42",
      },
    ],
  );
  assert.deepEqual(mixedEntities, []);
});

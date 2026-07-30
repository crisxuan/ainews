import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the AI hotspot briefing", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  const breaking = JSON.parse(
    await readFile(new URL("../data/breaking.json", import.meta.url), "utf8"),
  );
  const briefings = JSON.parse(
    await readFile(new URL("../data/briefings.json", import.meta.url), "utf8"),
  );
  const latestBriefing = briefings[0];
  const latestDiscussionLink = latestBriefing.topics
    .flatMap((topic) => topic.discussionLinks ?? [])
    .find((link) => link.url)?.url;
  assert.match(html, /AI 风向标/);
  assert.match(html, /准实时雷达/);
  assert.match(html, /briefing-anchor/);
  assert.match(html, /fengjiang-performance-hd\.webp/);
  assert.match(html, /fengjiang-performance-hd-still\.webp/);
  assert.match(html, /风酱先挥手打招呼，开心地笑起来，再跳一小段舞/);
  assert.match(html, /讨论现场/);
  assert.ok(latestDiscussionLink);
  assert.ok(html.includes(latestDiscussionLink));
  if (breaking.items.length === 0) {
    assert.match(html, /当前没有达到推送阈值的突发热点/);
  } else {
    assert.doesNotMatch(html, /当前没有达到推送阈值的突发热点/);
    for (const item of breaking.items) {
      assert.ok(html.includes(item.title));
      assert.ok(html.includes(item.link));
    }
  }
  assert.match(html, /60 分钟/);
  assert.match(html, /2\+ 来源/);
  assert.match(html, /6 小时/);
  assert.ok(html.includes(`风酱捞到的 ${latestBriefing.topics.length} 个热点`));
  assert.match(html, /风酱的信号袋/);
  assert.match(html, /以前吹过的风/);
  assert.ok(html.includes(latestBriefing.date));
  assert.match(html, /内容已归档/);
  for (const topic of latestBriefing.topics) {
    assert.ok(html.includes(topic.title));
    assert.ok(html.includes(topic.link));
  }
  assert.match(html, /08:00/);
  assert.match(html, /20:00/);
  assert.match(html, /每小时巡逻/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/);
});

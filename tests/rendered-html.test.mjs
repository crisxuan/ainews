import assert from "node:assert/strict";
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
  assert.match(html, /AI 风向标/);
  assert.match(html, /准实时雷达/);
  assert.match(html, /当前没有达到推送阈值的突发热点/);
  assert.match(html, /60 分钟/);
  assert.match(html, /2\+ 来源/);
  assert.match(html, /6 小时/);
  assert.match(html, /风酱捞到的 4 个热点/);
  assert.match(html, /风酱的信号袋/);
  assert.match(html, /以前吹过的风/);
  assert.match(html, /2026-07-25/);
  assert.match(html, /内容已归档/);
  assert.match(html, /Claude Opus 5/);
  assert.match(html, /08:00/);
  assert.match(html, /20:00/);
  assert.match(html, /每小时巡逻/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/);
});

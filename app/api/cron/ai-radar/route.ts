import {
  BRIEFING_MODEL,
  HOURLY_MODEL,
  collectCloudCandidates,
  createDatabase,
  runOpenAIRadar,
  selectMode,
  shanghaiClock,
} from "../../../../lib/cloud-radar.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 600;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  const gatewayToken =
    process.env.AI_GATEWAY_API_KEY ||
    process.env.VERCEL_OIDC_TOKEN ||
    request.headers.get("x-vercel-oidc-token");
  if (!databaseUrl || !gatewayToken) {
    return Response.json(
      { ok: false, error: "DATABASE_URL and Vercel AI Gateway authentication are required" },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const db = createDatabase(databaseUrl);
  if (url.searchParams.get("status") === "1") {
    return Response.json({ ok: true, runs: await db.recentRuns() });
  }

  const clock = shanghaiClock();
  const forcedMode = url.searchParams.get("mode") ?? undefined;
  const mode = selectMode(clock, forcedMode);
  const model =
    mode === "hourly"
      ? process.env.OPENAI_RADAR_MODEL || HOURLY_MODEL
      : process.env.OPENAI_BRIEFING_MODEL || BRIEFING_MODEL;
  const runId = `${clock.date}T${String(clock.hour).padStart(2, "0")}-${mode}`;
  const startedAt = new Date().toISOString();

  await db.startRun({ id: runId, mode, model, startedAt });
  try {
    const recentContext = await db.recentContext();
    const collected = await collectCloudCandidates(mode);
    const result = await runOpenAIRadar({ gatewayToken, mode, clock, recentContext, collected });
    const written =
      mode === "hourly"
        ? await db.writeBreaking(result.topics, startedAt)
        : await db.writeBriefing({
            mode,
            clock,
            title: result.title,
            summary: result.summary,
            topics: result.topics,
          });
    await db.finishRun({
      id: runId,
      status: "completed",
      found: result.topics.length,
      written,
      responseId: result.responseId,
    });
    return Response.json({
      ok: true,
      runId,
      mode,
      model: result.model,
      topicsFound: result.topics.length,
      topicsWritten: written,
      retrievedUrlCount: result.retrievedUrlCount,
      candidatesCollected: collected.candidates.length,
      successfulSources: result.successfulSources,
      failedSources: result.failedSources,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.finishRun({
      id: runId,
      status: "failed",
      found: 0,
      written: 0,
      responseId: null,
      error: message.slice(0, 2000),
    });
    console.error("Cloud AI radar run failed", { runId, mode, error });
    return Response.json({ ok: false, runId, mode, error: message }, { status: 500 });
  }
}

import fallbackBriefings from "../../../data/briefings.json";
import fallbackBreaking from "../../../data/breaking.json";
import { getHomepageFeed } from "../../../db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const liveHeaders = {
  "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
  "CDN-Cache-Control":
    "public, max-age=60, stale-while-revalidate=300, stale-if-error=86400",
  "Vercel-CDN-Cache-Control":
    "public, max-age=60, stale-while-revalidate=300, stale-if-error=86400",
  "X-Data-Source": "neon",
};

const fallbackHeaders = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "CDN-Cache-Control":
    "public, max-age=15, stale-while-revalidate=60, stale-if-error=300",
  "Vercel-CDN-Cache-Control":
    "public, max-age=15, stale-while-revalidate=60, stale-if-error=300",
  "X-Data-Source": "bundled-fallback",
};

export async function GET() {
  try {
    const feed = await getHomepageFeed();
    if (!feed.archiveIssues.length) {
      throw new Error("The database has no briefings yet");
    }
    return Response.json(feed, {
      headers: liveHeaders,
    });
  } catch (error) {
    console.error("Falling back to bundled hotspot data", error);
    return Response.json(
      {
        archiveIssues: fallbackBriefings,
        breakingFeed: fallbackBreaking,
        fallback: true,
      },
      {
        headers: fallbackHeaders,
      },
    );
  }
}

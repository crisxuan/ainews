import fallbackBriefings from "../../../data/briefings.json";
import fallbackBreaking from "../../../data/breaking.json";
import { getHomepageFeed } from "../../../db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const feed = await getHomepageFeed();
    if (!feed.archiveIssues.length) {
      throw new Error("The database has no briefings yet");
    }
    return Response.json(feed, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
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
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}

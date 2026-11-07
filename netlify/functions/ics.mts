import type { Config } from "@netlify/functions";
import { fail, fetchFeed } from "../lib/util.mts";

// Fetches a student's private Canvas calendar feed (browsers can't, because of CORS).
// The link is used for this one request and not stored.
export default async (req: Request) => {
  const feed = new URL(req.url).searchParams.get("url") || "";
  try {
    const ics = await fetchFeed(feed);
    return new Response(ics, { headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "no-store" } });
  } catch (e) {
    return fail((e as Error).message, 400);
  }
};

export const config: Config = {
  path: "/api/ics",
  method: "GET",
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 20 },
};

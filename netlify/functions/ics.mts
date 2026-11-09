import type { Config } from "@netlify/functions";
import { cors, json } from "../lib/cors.mts";

// Fetches a student's private Canvas Calendar Feed and returns it as-is.
// Browsers can't read Canvas feeds directly (CORS). The link is used for this one request only:
// it is never logged or stored.
export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  let u: URL;
  try { u = new URL(new URL(req.url).searchParams.get("url") || ""); }
  catch { return json(req, { error: "Paste the whole Calendar Feed link from Canvas." }, 400); }
  if (u.protocol !== "https:" || !/^(canvas\.jhu\.edu|[\w-]+\.instructure\.com)$/i.test(u.hostname) || !u.pathname.startsWith("/feeds/calendars/"))
    return json(req, { error: "That isn't a Canvas Calendar Feed link." }, 400);
  try {
    const r = await fetch(u, { headers: { accept: "text/calendar" }, redirect: "follow", signal: AbortSignal.timeout(12000) });
    if (!r.ok) return json(req, { error: r.status === 404 ? "Canvas doesn't recognise that link. Copy it again from Canvas → Calendar → Calendar Feed." : `Canvas returned an error (${r.status}).` }, 502);
    const text = await r.text();
    if (!text.includes("BEGIN:VCALENDAR")) return json(req, { error: "That link didn't return a calendar." }, 502);
    return new Response(text, { headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "no-store", ...cors(req) } });
  } catch {
    return json(req, { error: "Canvas didn't answer in time. Try again in a minute." }, 504);
  }
};

export const config: Config = {
  path: "/api/ics",
  method: ["GET", "OPTIONS"],
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 20 },
};

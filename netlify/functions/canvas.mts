import type { Config } from "@netlify/functions";
import { fail, json } from "../lib/util.mts";

// Read-only pass-through to the Canvas API with the student's own access token.
// The token arrives in a header for each request and is never logged or stored.
const ALLOWED = [/^\/api\/v1\/courses(\?|$)/, /^\/api\/v1\/courses\/\d+\/students\/submissions\?/, /^\/api\/v1\/courses\/\d+\/assignments(\?|$)/, /^\/api\/v1\/users\/self\/(upcoming_events|todo|missing_submissions)(\?|$)/];

export default async (req: Request) => {
  const path = new URL(req.url).searchParams.get("path") || "";
  const token = req.headers.get("x-canvas-token") || "";
  if (!token) return fail("Missing Canvas token", 401);
  if (!ALLOWED.some(r => r.test(path))) return fail("That Canvas request isn't allowed", 400);
  const r = await fetch("https://canvas.jhu.edu" + path, { headers: { authorization: "Bearer " + token, accept: "application/json" } });
  if (r.status === 401) return fail("Canvas didn't accept the token. Create a new one in Canvas → Account → Settings.", 401);
  if (!r.ok) return fail("Canvas returned " + r.status, 502);
  return json(await r.json());
};

export const config: Config = {
  path: "/api/canvas",
  method: "GET",
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 60 },
};

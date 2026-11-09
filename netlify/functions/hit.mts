import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { cors, json } from "../lib/cors.mts";

// Privacy-friendly usage count. Each browser sends at most one ping per day.
// We store one empty entry per ping under that day, with a random key the server makes up.
// No IP address, cookie, device ID or location is stored. Append-only, so no counter races.
export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  let plan = false;
  try { plan = !!(await req.json())?.plan; } catch {}
  const day = new Date().toISOString().slice(0, 10);
  await getStore("usage").set(`${day}/${plan ? "plan" : "visit"}/${crypto.randomUUID()}`, "");
  return json(req, { ok: true });
};

export const config: Config = {
  path: "/api/hit",
  method: ["POST", "OPTIONS"],
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 10 },
};

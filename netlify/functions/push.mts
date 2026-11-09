import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { cors, json } from "../lib/cors.mts";

// Deadline reminders. The browser sends its push subscription plus the deadlines it wants reminders
// for (title, course, due time). Nothing else is stored: no Canvas link, no name, no email.
// POST /api/push       { subscription, items: [{ id, title, course, due }] }  → save or replace
// POST /api/push/off   { endpoint }                                            → delete
const keyFor = async (endpoint: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(endpoint));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
};

export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  const store = getStore("push");
  let body: any = {};
  try { body = await req.json(); } catch { return json(req, { error: "Bad request" }, 400); }
  if (new URL(req.url).pathname.endsWith("/off")) {
    if (body.endpoint) await store.delete(await keyFor(body.endpoint));
    return json(req, { ok: true });
  }
  const sub = body.subscription;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) return json(req, { error: "Missing push subscription" }, 400);
  const now = Date.now();
  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 200)
    .map((i: any) => ({ id: String(i.id).slice(0, 120), title: String(i.title || "").slice(0, 100), course: String(i.course || "").slice(0, 40), due: Date.parse(i.due) }))
    .filter((i: any) => i.id && i.title && i.due > now && i.due < now + 60 * 864e5);
  const key = await keyFor(sub.endpoint);
  const prev: any = await store.get(key, { type: "json" });
  await store.setJSON(key, { sub, items, sent: (prev?.sent || []).filter((s: string) => items.some((i: any) => s.endsWith(":" + i.id))) });
  return json(req, { ok: true, reminders: items.length });
};

export const config: Config = {
  path: ["/api/push", "/api/push/off"],
  method: ["POST", "OPTIONS"],
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 20 },
};

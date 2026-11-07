import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { fail, json, sha, isCanvasHost } from "../lib/util.mts";

// Push alert sign-up. Stores the browser's push subscription and the student's Canvas calendar
// link so the hourly checker (push-check) can send "due soon" alerts while the app is closed.
// One record per device; unsubscribing deletes it.

export default async (req: Request) => {
  const path = new URL(req.url).pathname;
  const store = getStore("push-subs");
  if (path.endsWith("/key")) {
    const key = Netlify.env.get("VAPID_PUBLIC_KEY");
    return key ? json({ key }) : fail("Push isn't configured on the server", 503);
  }
  if (req.method !== "POST") return fail("Use POST", 405);
  const body = await req.json().catch(() => ({}));
  if (path.endsWith("/subscribe")) {
    const sub = body.subscription, feed = String(body.feed || "");
    if (!sub?.endpoint || !/^https:\/\//.test(sub.endpoint)) return fail("Bad subscription");
    try { const u = new URL(feed); if (!isCanvasHost(u.hostname) || !u.pathname.startsWith("/feeds/calendars/")) throw 0; } catch { return fail("Bad Canvas feed link"); }
    const id = await sha(sub.endpoint);
    await store.setJSON(id, { subscription: sub, feed, tz: String(body.tz || "America/New_York").slice(0, 60), created: Date.now() });
    return json({ ok: true });
  }
  if (path.endsWith("/unsubscribe")) {
    if (!body.endpoint) return fail("Missing endpoint");
    await store.delete(await sha(String(body.endpoint)));
    return json({ ok: true });
  }
  return fail("Not found", 404);
};

export const config: Config = {
  path: ["/api/push/key", "/api/push/subscribe", "/api/push/unsubscribe"],
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 20 },
};

import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import webpush from "web-push";
import { fetchFeed, parseICS, sha } from "../lib/util.mts";

// Runs every hour. For each device that turned on push alerts, reads its Canvas calendar feed
// and sends one alert ~24 hours before each assignment is due and one ~2 hours before.
// "Sent" markers stop repeats. Dead subscriptions (410/404) are deleted.

export default async () => {
  const pub = Netlify.env.get("VAPID_PUBLIC_KEY"), priv = Netlify.env.get("VAPID_PRIVATE_KEY");
  if (!pub || !priv) { console.log("VAPID keys not set; skipping"); return; }
  webpush.setVapidDetails(Netlify.env.get("VAPID_SUBJECT") || "mailto:sfnu1@jh.edu", pub, priv);
  const subs = getStore("push-subs"), sent = getStore("push-sent");
  const { blobs } = await subs.list();
  const now = Date.now();
  let n = 0;
  for (const { key } of blobs) {
    const rec = await subs.get(key, { type: "json" }).catch(() => null) as any;
    if (!rec) continue;
    let items;
    try { items = parseICS(await fetchFeed(rec.feed)); } catch (e) { console.log("feed failed", key, (e as Error).message); continue; }
    let dead = false;
    for (const d of items) {
      if (dead) break;
      if (!d.assignment && !/due|quiz|exam|homework|hw|project|lab|essay|midterm|final/i.test(d.title)) continue;
      const left = d.due.getTime() - now;
      const windows: [string, number, number][] = [["24h", 23 * 36e5, 25 * 36e5], ["2h", 1 * 36e5, 2.5 * 36e5]];
      for (const [tag, lo, hi] of windows) {
        if (left < lo || left > hi) continue;
        const mark = `${key}/${await sha(d.uid)}-${tag}`;
        if (await sent.get(mark)) continue;
        const when = d.due.toLocaleString("en-US", { timeZone: rec.tz || "America/New_York", weekday: "short", hour: "numeric", minute: "2-digit" });
        try {
          await webpush.sendNotification(rec.subscription, JSON.stringify({
            title: `${tag === "2h" ? "Due in 2 hours" : "Due tomorrow"}: ${d.title}`,
            body: `${d.course.split(" ").slice(0, 4).join(" ")} · ${when}`,
            tag: `${tag}-${d.uid}`, kind: "due", url: "./#classes/due", link: d.url,
          }), { TTL: 3600 });
          await sent.set(mark, String(now), { metadata: { expires: d.due.getTime() + 864e5 } });
          n++;
        } catch (e: any) {
          if (e?.statusCode === 404 || e?.statusCode === 410) { await subs.delete(key); dead = true; break; }
          console.log("push failed", e?.statusCode);
        }
      }
    }
  }
  // Tidy old "sent" markers.
  const old = await sent.list();
  for (const { key } of old.blobs) {
    const meta = await sent.getMetadata(key).catch(() => null);
    if (meta && (meta.metadata as any)?.expires < now) await sent.delete(key);
  }
  console.log(`push-check: ${blobs.length} devices, ${n} alerts sent`);
};

// Every hour at minute 7 (UTC).
export const config: Config = { schedule: "7 * * * *" };

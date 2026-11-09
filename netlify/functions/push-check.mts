import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import webpush from "web-push";

// Every 15 minutes: send a reminder 24 hours and 2 hours before each saved deadline.
export default async () => {
  const pub = Netlify.env.get("VAPID_PUBLIC_KEY"), priv = Netlify.env.get("VAPID_PRIVATE_KEY");
  if (!pub || !priv) { console.log("Push not configured"); return; }
  webpush.setVapidDetails(Netlify.env.get("VAPID_SUBJECT") || "mailto:sfnu1@jh.edu", pub, priv);
  const store = getStore("push"), now = Date.now();
  const { blobs } = await store.list();
  let sentCount = 0;
  for (const { key } of blobs) {
    const rec: any = await store.get(key, { type: "json" });
    if (!rec?.sub) continue;
    const sent = new Set<string>(rec.sent || []);
    let changed = false, gone = false;
    for (const i of rec.items) {
      const left = i.due - now;
      for (const [tag, win] of [["24h", 24 * 36e5], ["2h", 2 * 36e5]] as const) {
        const id = `${tag}:${i.id}`;
        if (left > 0 && left <= win && !sent.has(id) && !(tag === "24h" && left <= 2 * 36e5)) {
          const when = new Date(i.due).toLocaleString("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "2-digit" });
          try {
            await webpush.sendNotification(rec.sub, JSON.stringify({ title: `${tag === "2h" ? "Due in 2 hours" : "Due tomorrow"}: ${i.title}`, body: `${i.course ? i.course + " · " : ""}${when}`, tag: id, url: "./#academics" }), { TTL: 3600 });
            sentCount++;
          } catch (e: any) { if (e.statusCode === 404 || e.statusCode === 410) gone = true; }
          sent.add(id); changed = true;
        }
      }
    }
    if (gone) { await store.delete(key); continue; }
    const items = rec.items.filter((i: any) => i.due > now);
    if (changed || items.length !== rec.items.length) await store.setJSON(key, { sub: rec.sub, items, sent: [...sent] });
  }
  console.log(`Reminders sent: ${sentCount}`);
};

export const config: Config = { schedule: "*/15 * * * *" };

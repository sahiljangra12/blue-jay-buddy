import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { json } from "../lib/cors.mts";

// Daily totals for the last 30 days: how many browsers opened Blue Jay Buddy, and how many of those
// had set up a personal plan. Totals only; there is nothing per-person to show.
export default async (req: Request) => {
  const store = getStore("usage");
  const days: { date: string; visitors: number; withPlan: number }[] = [];
  const today = new Date();
  await Promise.all([...Array(30)].map(async (_, i) => {
    const d = new Date(today); d.setUTCDate(today.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    const { blobs } = await store.list({ prefix: `${date}/` });
    const withPlan = blobs.filter(b => b.key.startsWith(`${date}/plan/`)).length;
    days.push({ date, visitors: blobs.length, withPlan });
  }));
  days.sort((a, b) => a.date.localeCompare(b.date));
  return json(req, { days, total: days.reduce((s, d) => s + d.visitors, 0) });
};

export const config: Config = { path: "/api/stats", method: "GET" };

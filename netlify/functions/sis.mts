import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { fail, json } from "../lib/util.mts";

// Public JHU class search (sis.jhu.edu/api). Answers two questions:
//   1. Which recent terms was this course offered in? (Fall / Spring / Summer)
//   2. When and where does it meet this term? (fills gaps after a schedule upload)
// Needs SIS_API_KEY (free: request one at https://sis.jhu.edu/api). Results are cached for 7 days.

const SEASONS = ["Spring", "Summer", "Fall"];
function terms(now = new Date()) {
  const y = now.getUTCFullYear(), m = now.getUTCMonth();
  const cur = m <= 4 ? 0 : m <= 6 ? 1 : 2;
  const list: string[] = [];
  for (let k = -6; k <= 1; k++) {
    const idx = cur + k, yy = y + Math.floor(idx / 3), s = ((idx % 3) + 3) % 3;
    list.push(`${SEASONS[s]} ${yy}`);
  }
  return { list, current: `${SEASONS[cur]} ${y}` };
}

const DOW: Record<string, number> = { M: 1, T: 2, W: 3, Th: 4, F: 5, Sa: 6, S: 0 };
function meeting(sec: any) {
  const m = (sec.SectionDetails?.[0]?.Meetings?.[0]) || {};
  const raw = String(m.DOW || sec.Meetings || "");
  const dowPart = raw.split(/\s+/)[0] || "";
  const days = [...dowPart.matchAll(/Th|Sa|M|T|W|F|S/g)].map(x => DOW[x[0]]).filter(d => d !== undefined);
  const t = String(m.Times || sec.Meetings || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  const to24 = (h: string, mm: string, ap: string) => { let H = +h % 12; if (/pm/i.test(ap)) H += 12; return String(H).padStart(2, "0") + ":" + mm; };
  return {
    days, start: t ? to24(t[1], t[2], t[3]) : "", end: t ? to24(t[4], t[5], t[6]) : "",
    building: String(m.Building || sec.Building || sec.Location || ""), room: String(m.Room || "").trim(),
    instructor: String(sec.InstructorsFullName || ""), section: String(sec.SectionName || ""),
  };
}

export default async (req: Request) => {
  const key = Netlify.env.get("SIS_API_KEY");
  const u = new URL(req.url);
  const course = (u.searchParams.get("course") || "").toUpperCase();
  const section = u.searchParams.get("section") || "";
  const m = course.match(/^([A-Z]{2})\.?(\d{3})\.?(\d{3})$/);
  if (!m) return fail("Use a course number like EN.553.613");
  if (!key) return json({ error: "SIS lookup not configured", terms: [] });
  const id = `${m[1]}${m[2]}${m[3]}`, T = terms();
  const store = getStore("sis-cache");
  const cacheKey = `${id}`;
  const cached = await store.get(cacheKey, { type: "json" }).catch(() => null) as any;
  let byTerm: Record<string, any[]> = cached && Date.now() - cached.at < 7 * 864e5 ? cached.byTerm : {};
  if (!cached || Date.now() - cached.at >= 7 * 864e5) {
    await Promise.all(T.list.map(async term => {
      try {
        const r = await fetch(`https://sis.jhu.edu/api/classes/${id}/${encodeURIComponent(term)}?key=${encodeURIComponent(key)}`);
        if (r.ok) { const arr = await r.json(); if (Array.isArray(arr) && arr.length) byTerm[term] = arr; }
      } catch {}
    }));
    await store.setJSON(cacheKey, { at: Date.now(), byTerm }).catch(() => {});
  }
  const offered = T.list.filter(t => byTerm[t]?.length);
  const cur = byTerm[T.current] || [];
  const sec = cur.find(s => !section || String(s.SectionName) === section || String(s.SectionName).padStart(2, "0") === section.padStart(2, "0")) || cur[0];
  return json({
    course: `${m[1]}.${m[2]}.${m[3]}`,
    terms: offered,
    pattern: [...new Set(offered.map(t => t.split(" ")[0]))],
    current: sec ? meeting(sec) : null,
  });
};

export const config: Config = {
  path: "/api/sis",
  method: "GET",
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 60 },
};

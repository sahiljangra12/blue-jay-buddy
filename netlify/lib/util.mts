// Shared helpers for Blue Jay Buddy functions.

export const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });

export const fail = (error: string, status = 400) => json({ error }, status);

// Canvas feeds and API calls may only go to Canvas hosts.
export const CANVAS_HOSTS = [/^canvas\.jhu\.edu$/i, /^[\w-]+\.instructure\.com$/i];
export const isCanvasHost = (host: string) => CANVAS_HOSTS.some(r => r.test(host));

export async function sha(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

/* Minimal Canvas .ics parser (same rules as the app). */
export type Due = { uid: string; title: string; course: string; due: Date; url: string; assignment: boolean };
export function parseICS(ics: string): Due[] {
  const text = ics.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
  const out: Due[] = [];
  for (const block of text.split("BEGIN:VEVENT").slice(1)) {
    const get = (k: string) => { const m = block.match(new RegExp("^" + k + "(?:;[^:\\n]*)?:(.*)$", "m")); return m ? m[1].trim() : ""; };
    const summary = get("SUMMARY").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\n/g, " ");
    const d = get("DTSTART").match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
    if (!summary || !d) continue;
    // Floating or all-day times are treated as US Eastern (Canvas sends UTC "Z" times for assignments).
    const due = d[4] ? (d[7] ? new Date(Date.UTC(+d[1], +d[2] - 1, +d[3], +d[4], +d[5], +d[6])) : new Date(Date.UTC(+d[1], +d[2] - 1, +d[3], +d[4] + 5, +d[5], +d[6])))
                     : new Date(Date.UTC(+d[1], +d[2] - 1, +d[3] + 1, 4, 59));
    const cm = summary.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
    const uid = get("UID"), url = get("URL");
    out.push({ uid: uid || summary + due.toISOString(), title: cm ? cm[1] : summary, course: cm ? cm[2] : "", due, url, assignment: /assignment/i.test(uid + url) });
  }
  return out;
}

export async function fetchFeed(feed: string) {
  const u = new URL(feed);
  if (u.protocol !== "https:" || !isCanvasHost(u.hostname) || !u.pathname.startsWith("/feeds/calendars/")) throw new Error("Not a Canvas calendar feed link");
  const r = await fetch(u, { headers: { accept: "text/calendar" }, redirect: "follow" });
  if (!r.ok) throw new Error("Canvas returned " + r.status);
  const t = await r.text();
  if (!t.includes("BEGIN:VCALENDAR")) throw new Error("That link didn't return a calendar");
  return t;
}

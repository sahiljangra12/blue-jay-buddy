// Builds events.json: the next 7 days of Hopkins Groups events, small enough for phones.
// Source: the public Hopkins Groups calendar (all public events from all groups).
// Run: node scripts/build-events.mjs [path-to-local.ics]
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SRC = "https://jhu.campusgroups.com/ical/jhu/ical_jhu.ics";
const DAYS = 7, MAX = 400;
// Events clearly for another campus or for members only.
const OTHER_CAMPUS = /\b(SAIS|Carey|Bloomberg School|Public Health|Peabody|Nursing|School of Medicine|SOM|APL|Bologna|Nanjing|Washington,? DC|D\.C\.)\b/i;
const MEMBERS_ONLY = /\b(e-?board|executive board|officer meeting|chapter meeting|exec meeting|board meeting|members only|initiat)/i;
const SKIP_TYPES = /practice|rehearsal|training/i;
const FOOD = /\b(free food|pizza|snacks?|dinner|lunch|breakfast|brunch|refreshments|boba|bubble tea|donuts?|cookies|food (will be|is) (provided|served)|catered|dessert|ice cream|coffee and)\b/i;

const unfold = s => s.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
const qp = s => { // quoted-printable → UTF-8 text
  const bytes = []; s = s.replace(/=\n/g, "");
  for (let i = 0; i < s.length; i++){
    if (s[i] === "=" && /^[0-9A-F]{2}$/i.test(s.substr(i + 1, 2))){ bytes.push(parseInt(s.substr(i + 1, 2), 16)); i += 2; }
    else bytes.push(...Buffer.from(s[i]));
  }
  return Buffer.from(bytes).toString("utf8");
};
const txt = s => (s || "").replace(/\\n/g, " ").replace(/\\,/g, ",").replace(/\;/g, ";").replace(/\\\\/g, "\\").replace(/\s+/g, " ").trim();
function when(v){
  const m = (v || "").match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (!m) return null;
  if (!m[4]) return { date: new Date(Date.UTC(+m[1], m[2] - 1, +m[3], 5)), allDay: true }; // all-day: midnight Eastern-ish
  return { date: m[7] ? new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5])) : new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4] + 5, +m[5])), allDay: false };
}

const ics = process.argv[2] && existsSync(process.argv[2]) ? readFileSync(process.argv[2], "utf8")
  : await (await fetch(SRC, { headers: { "user-agent": "BlueJayBuddy/1.0 (+https://github.com/sahiljangra12/blue-jay-buddy)" }, redirect: "follow" })).text();
if (!ics.includes("BEGIN:VCALENDAR")) { console.error("Not a calendar"); process.exit(1); }

const now = Date.now(), until = now + DAYS * 864e5, out = [];
for (const block of unfold(ics).split("BEGIN:VEVENT").slice(1)){
  const get = k => { const m = block.match(new RegExp("^" + k + "((?:;[^:\\n]*)?):(.*)$", "m")); if (!m) return ""; return /QUOTED-PRINTABLE/i.test(m[1]) ? qp(m[2]) : m[2]; };
  const cats = [...block.matchAll(/^CATEGORIES;X-CG-CATEGORY=([a-z_]+):(.*)$/gm)].reduce((o, [, k, v]) => (o[k] = v.trim(), o), {});
  const start = when(get("DTSTART")), end = when(get("DTEND"));
  if (!start) continue;
  const endMs = end ? end.date.getTime() : start.date.getTime() + 36e5;
  if (endMs < now || start.date.getTime() > until) continue;
  const title = txt(get("SUMMARY")), host = txt((block.match(/^ORGANIZER;CN="?([^":]*)"?/m) || [])[1]);
  const desc = txt(get("DESCRIPTION")).replace(/---\s*Event Details:.*$/, "").trim();
  const place = txt(get("LOCATION"));
  const type = cats.event_type || "";
  if (!title || SKIP_TYPES.test(type) || MEMBERS_ONLY.test(title)) continue;
  if (OTHER_CAMPUS.test(host + " " + (cats.event_tags || "")) && !/21218|N\.? Charles|Homewood/i.test(place)) continue;
  out.push({
    t: title.slice(0, 120), s: start.date.toISOString(), e: new Date(endMs).toISOString(), ad: start.allDay || undefined,
    h: host.slice(0, 80), ty: type.slice(0, 40) || undefined,
    p: /sign in/i.test(place) ? undefined : place.replace(/,?\s*Baltimore,? MD\s*21218,?\s*(United States)?/i, "").replace(/,\s*3400 N\.? Charles St\.?/i, "").slice(0, 90) || undefined,
    f: FOOD.test(title + " " + desc) || undefined,
    u: get("URL").trim() || undefined,
  });
}
out.sort((a, b) => a.s.localeCompare(b.s));
const json = { built: new Date().toISOString(), source: "https://jhu.campusgroups.com/events", events: out.slice(0, MAX) };
writeFileSync("events.json", JSON.stringify(json));
console.log(`events.json: ${json.events.length} events in the next ${DAYS} days (${json.events.filter(e => e.f).length} with food)`);

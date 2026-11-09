// Canvas deadlines from the student's private Canvas Calendar Feed (no password, no Canvas login here).
// The feed is fetched through a small helper on Netlify, because browsers block reading Canvas directly.
// If that helper can't be reached, students can upload the downloaded .ics file instead.
(() => {
"use strict";
const API = location.hostname.endsWith("netlify.app") || location.hostname === "localhost" && location.port === "8888"
  ? "" : "https://blue-jay-buddy.netlify.app";

const unfold = ics => ics.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
const txt = s => (s || "").replace(/\\n/g, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\").trim();
// Canvas sends assignment times in UTC ("Z"). All-day items count as due at 11:59 PM that day.
function icsDate(v){
  const m = (v || "").match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (!m) return null;
  if (!m[4]) return new Date(+m[1], m[2] - 1, +m[3], 23, 59);
  return m[7] ? new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6])) : new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
}
const shortCourse = c => { const m = (c || "").match(/([A-Z]{2})\.?(\d{3})\.?(\d{3})/); return m ? `${m[1]}.${m[2]}.${m[3]}` : (c || "").split(/\s+/).slice(0, 3).join(" "); };

function parseICS(ics){
  if (!/BEGIN:VCALENDAR/.test(ics)) throw new Error("That isn't a calendar file. Copy the Calendar Feed link from Canvas again.");
  const out = [];
  unfold(ics).split("BEGIN:VEVENT").slice(1).forEach(block => {
    const get = k => { const m = block.match(new RegExp("^" + k + "(?:;[^:\\n]*)?:(.*)$", "m")); return m ? m[1].trim() : ""; };
    const summary = txt(get("SUMMARY")), uid = get("UID"), url = get("URL");
    const due = icsDate(get("DTSTART"));
    if (!summary || !due) return;
    const cm = summary.match(/^(.*?)\s*\[([^\]]+)\]\s*$/); // Canvas: "Homework 3 [EN.553.613.01.FA26 ...]"
    const assignment = /assignment/i.test(uid + url) || /\b(due|quiz|exam|homework|hw|project|lab|essay|report|midterm|final|problem set|pset)\b/i.test(summary);
    out.push({ uid: uid || summary + due.toISOString(), title: cm ? cm[1] : summary, course: shortCourse(cm ? cm[2] : ""), due: due.toISOString(), url, assignment, src: "canvas" });
  });
  return out.sort((a, b) => new Date(a.due) - new Date(b.due));
}

function checkFeed(link){
  let u;
  try { u = new URL(link.trim()); } catch { throw new Error("Paste the whole link. It starts with https://canvas.jhu.edu/feeds/calendars/"); }
  if (!/^(canvas\.jhu\.edu|[\w-]+\.instructure\.com)$/i.test(u.hostname) || !u.pathname.startsWith("/feeds/calendars/"))
    throw new Error("That isn't a Canvas Calendar Feed link. It should start with https://canvas.jhu.edu/feeds/calendars/");
  return u.href;
}

async function fetchFeed(link){
  const feed = checkFeed(link);
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(`${API}/api/ics?url=${encodeURIComponent(feed)}`, { signal: ctl.signal });
    const body = await r.text();
    if (!r.ok) { let msg = ""; try { msg = JSON.parse(body).error; } catch {} throw new Error(msg || `Canvas couldn't be reached (${r.status}).`); }
    return parseICS(body);
  } catch (e) {
    if (e.name === "AbortError" || e instanceof TypeError) { const err = new Error("Couldn't reach Canvas from here."); err.offline = true; throw err; }
    throw e;
  } finally { clearTimeout(t); }
}

window.BJB_CANVAS = { parseICS, fetchFeed, checkFeed, API };
})();

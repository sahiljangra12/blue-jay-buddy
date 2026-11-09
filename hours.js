// Opening hours for "Open now" labels.
// Only hours copied from an official page go here. Outside a listed date range, or on dates marked
// "unknown" (breaks, holidays), the app says "Check hours" instead of guessing.
// Times are 24-hour "HH:MM". A closing time after midnight is written past 24, e.g. "26:00" = 2 AM.
// Days: 0 = Sunday … 6 = Saturday. null = closed that day.
(() => {
"use strict";
const H = window.BJB_HOURS = {
  rec: {
    name: "O'Connor Rec Center",
    short: "Rec center",
    url: "https://studentaffairs.jhu.edu/recreation/ralph-s-oconnor-recreation-center/hours-of-operation",
    checked: "2026-11",
    note: "Weight rooms and courts close 10 minutes before the building. Pool and climbing wall keep their own hours.",
    rules: [
      // Fall and spring semester hours from the rec center's hours page.
      { from: "2026-11-01", to: "2026-12-12", week: { 0: ["10:00","22:00"], 1: ["06:00","24:00"], 2: ["06:00","24:00"], 3: ["06:00","24:00"], 4: ["06:00","24:00"], 5: ["06:00","22:00"], 6: ["08:00","22:00"] } },
    ],
    unknown: [["2026-11-25","2026-11-29"]], // Thanksgiving break: hours not posted
  },
  brody: {
    name: "Brody Learning Commons",
    short: "Brody",
    url: "https://www.library.jhu.edu/library-hours/brody-learning-commons",
    checked: "2026-11",
    note: "Late at night, you need your J-Card to get in.",
    rules: [
      { from: "2026-11-01", to: "2026-11-14", every: ["07:30","26:00"] },
      { from: "2026-11-15", to: "2026-11-21", week: { 0: ["07:30","26:00"], 1: ["07:30","26:00"], 2: ["07:30","26:00"], 3: ["07:30","26:00"], 4: ["07:30","26:00"], 5: ["07:30","18:00"], 6: ["07:30","18:00"] } },
      { from: "2026-11-29", to: "2026-12-12", every: ["07:30","26:00"] },
      { from: "2026-12-13", to: "2026-12-22", every: ["00:00","24:00"] },
      { from: "2026-12-23", to: "2026-12-23", every: ["07:30","18:00"] },
      { from: "2026-12-24", to: "2027-01-03", every: null },
      { from: "2027-01-04", to: "2027-01-09", every: ["07:30","18:00"] },
      { from: "2027-01-10", to: "2027-01-10", every: ["12:00","18:00"] },
      { from: "2027-01-11", to: "2027-01-16", every: ["07:30","18:00"] },
      { from: "2027-01-17", to: "2027-01-17", every: ["12:00","18:00"] },
      { from: "2027-01-19", to: "2027-01-23", every: ["07:30","18:00"] },
    ],
    unknown: [["2026-11-22","2026-11-28"], ["2027-01-18","2027-01-18"]],
  },
};

const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const toMin = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
const label = m => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return (h === 0 ? "12" : ((h + 11) % 12 + 1)) + (mm ? ":" + String(mm).padStart(2, "0") : "") + (h >= 12 ? " PM" : " AM"); };

// Hours for one calendar date: [openMin, closeMin] | null (closed) | undefined (not known).
function dayHours(place, date){
  const key = ymd(date);
  if ((place.unknown || []).some(([a, b]) => key >= a && key <= b)) return undefined;
  const r = place.rules.find(r => key >= r.from && key <= r.to);
  if (!r) return undefined;
  const v = "every" in r ? r.every : r.week[date.getDay()];
  return v ? [toMin(v[0]), toMin(v[1])] : null;
}

// Status right now: { known, open, text, until, opensAt, allDay }
H.status = (id, now = new Date()) => {
  const p = H[id]; if (!p) return { known: false, text: "Check hours" };
  const m = now.getHours() * 60 + now.getMinutes();
  const y = new Date(now); y.setDate(now.getDate() - 1);
  const today = dayHours(p, now), yest = dayHours(p, y);
  // Still open from yesterday's late closing (e.g. until 2 AM)?
  if (yest && yest[1] > 1440 && m < yest[1] - 1440) return { known: true, open: true, text: `Open until ${label(yest[1])}` };
  if (today === undefined) return { known: false, text: "Check hours" };
  if (today && today[0] === 0 && today[1] >= 1440){
    const t = new Date(now); t.setDate(now.getDate() + 1);
    const nx = dayHours(p, t);
    return { known: true, open: true, allDay: true, text: nx && nx[0] === 0 ? "Open 24 hours" : `Open until ${label(today[1])}` };
  }
  if (today && m >= today[0] && m < today[1]){
    const left = today[1] - m;
    return { known: true, open: true, closingSoon: left <= 60, text: left <= 60 ? `Closes in ${left} min` : `Open until ${label(today[1])}` };
  }
  if (today && m < today[0]) return { known: true, open: false, text: `Opens at ${label(today[0])}` };
  // Closed for the rest of today: look ahead to tomorrow.
  const t = new Date(now); t.setDate(now.getDate() + 1);
  const nx = dayHours(p, t);
  if (nx) return { known: true, open: false, text: `Closed · opens ${label(nx[0])} tomorrow` };
  if (nx === null) return { known: true, open: false, text: "Closed" };
  return { known: true, open: false, text: "Closed now" };
};

// The week's hours as rows for a table (starting Sunday of this week).
H.week = (id, now = new Date()) => {
  const p = H[id], start = new Date(now); start.setDate(now.getDate() - now.getDay());
  return [...Array(7)].map((_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const h = dayHours(p, d);
    return { day: d.getDay(), today: d.getDay() === now.getDay(),
      text: h === undefined ? "Check official hours" : h === null ? "Closed" : h[0] === 0 && h[1] >= 1440 ? "Open 24 hours" : `${label(h[0])} – ${label(h[1])}` };
  });
};
})();

// Today: only what matters right now. Next class, what's due, quick status tiles, and setup progress.
(() => {
"use strict";
const App = window.App, { esc, svg, fmt, mins, DAY, money, store } = App;

App.nextClass = () => {
  const now = new Date(), d = now.getDay(), m = now.getHours() * 60 + now.getMinutes(), cls = App.S.classes;
  for (let off = 0; off < 7; off++){
    const day = (d + off) % 7;
    for (const c of cls.filter(c => c.days.includes(day)).sort((a, b) => mins(a.start) - mins(b.start))){
      if (off === 0 && mins(c.end) <= m) continue;
      const live = off === 0 && mins(c.start) <= m;
      return { c, live, startsIn: off === 0 && !live ? mins(c.start) - m : null,
        when: live ? `Happening now · ends ${fmt(c.end)}` : off === 0 ? `Today at ${fmt(c.start)}` : off === 1 ? `Tomorrow at ${fmt(c.start)}` : `${DAY[day]} at ${fmt(c.start)}` };
    }
  }
  return null;
};

/* ---------- weather (Open-Meteo: free, no key) ---------- */
let wx = store.get("bjb-wx", null);
const WMO = c => c === 0 ? "Clear" : c <= 3 ? "Partly cloudy" : c <= 48 ? "Foggy" : c <= 67 ? "Rain" : c <= 77 ? "Snow" : c <= 82 ? "Showers" : c <= 86 ? "Snow showers" : "Storms";
async function loadWx(){
  if (wx && Date.now() - wx.at < 30 * 6e4) return;
  try {
    const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=39.329&longitude=-76.62&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=America%2FNew_York&forecast_days=1");
    const j = await r.json();
    wx = { at: Date.now(), t: Math.round(j.current.temperature_2m), code: j.current.weather_code, hi: Math.round(j.daily.temperature_2m_max[0]), lo: Math.round(j.daily.temperature_2m_min[0]), rain: j.daily.precipitation_probability_max[0] };
    store.set("bjb-wx", wx);
    if (App.route().tab === "today" && !App.$("#q").value) App.render();
  } catch {}
}

App.views.today = () => {
  loadWx();
  const prof = App.S.profile, n = App.nextClass(), h = new Date().getHours();
  const greet = h < 5 ? "Up late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const real = App.S.classes.filter(c => !c.ex);
  const up = App.upcoming(7), late = App.deadlines().filter(d => !d.isDone && new Date(d.due) < Date.now() && Date.now() - new Date(d.due) < 14 * 864e5);
  const r = App.recToday(), left = App.budgetLeft();
  const todays = App.S.classes.filter(c => c.days.includes(new Date().getDay())).sort((a, b) => mins(a.start) - mins(b.start));
  const steps = App.S.setupList();
  const doneSteps = steps.filter(s => s.done).length;

  const nextTile = n ? `
    <span class="eyebrow">${n.live ? "Now" : "Next class"}${n.c.ex ? " · example" : ""}</span>
    <b class="big">${esc(n.c.name)}</b>
    <span class="sub">${esc(n.when)} · ${esc(App.where(n.c))}</span>
    ${n.startsIn !== null && n.startsIn < 180 ? `<span class="count ${n.startsIn <= 15 ? "hot" : ""}">Starts in ${n.startsIn >= 60 ? Math.floor(n.startsIn / 60) + "h " : ""}${n.startsIn % 60}m${n.startsIn <= 15 ? (n.c.mode === "online" ? " · time to log on" : " · time to head out") : ""}</span>` : ""}
    <div class="row">${n.c.ex ? `<button class="btn light" type="button" data-import>${svg("upload")}Add my real classes</button>` : App.classGo(n.c, "btn light")}
    ${todays.length > 1 ? `<a class="btn glass" href="#classes/schedule">${todays.length} classes today</a>` : `<a class="btn glass" href="#classes/schedule">My week</a>`}</div>`
    : `<span class="eyebrow">Next class</span><b class="big">${real.length ? "No more classes this week" : "Add your classes"}</b>
       <span class="sub">${real.length ? "Enjoy the break." : "Upload your SIS schedule and we'll fill in everything."}</span>
       ${real.length ? "" : `<div class="row"><button class="btn light" type="button" data-import>${svg("upload")}Upload schedule</button></div>`}`;

  const dueBlock = !App.canvas.feed && !(App.canvas.manual || []).length
    ? `<div class="tile"><span class="eyebrow">${svg("clock", 'width="14" height="14"')} Due soon</span><b class="t2">See every deadline here</b><p class="note">Connect Canvas once to see what's due, what's late and new grades.</p><button class="btn sm primary" type="button" data-canvas>${svg("link")}Connect Canvas</button></div>`
    : `<div class="tile"><span class="eyebrow">${svg("clock", 'width="14" height="14"')} Due in the next 7 days · ${up.length}</span>
       ${late.length ? `<a class="late-pill" href="#classes/due">${svg("alert", 'width="14" height="14"')}${late.length} late</a>` : ""}
       ${up.length ? `<ul class="mini-dls">${up.slice(0, 4).map(d => `<li class="${new Date(d.due) - Date.now() < 864e5 ? "soon" : ""}"><b>${esc(d.title)}</b><span>${esc(d.courseShort || "")} · ${App.relTime(d.due)}</span></li>`).join("")}</ul>` : `<p class="note">Nothing due this week.</p>`}
       <a class="linkbtn" href="#classes/due">All deadlines ›</a></div>`;

  return `<section class="page today">
  <div class="hello-row"><div><h1>${greet}${prof?.name ? ", " + esc(prof.name) : ""}</h1><p class="sub">${new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p></div>
    <a class="ask-cta" href="#ask" aria-label="Ask Blue Jay Buddy">${svg("mic")}<span>Ask</span></a></div>

  <div class="hero-grid">
    <div class="tile next">${nextTile}</div>
    ${dueBlock}
  </div>

  <div class="quad">
    <a class="qt" href="#campus/gym"><span class="eyebrow">${svg("dumbbell", 'width="14" height="14"')} Gym</span><b class="${r.open ? "ok" : ""}">${r.open ? "Open now" : r.opensLater ? "Opens later" : "Closed"}</b><span>${esc(r.hours)}</span></a>
    <a class="qt" href="#food/plan"><span class="eyebrow">${svg("wallet", 'width="14" height="14"')} Food budget</span><b class="${left < 0 ? "bad" : ""}">${money(Math.abs(left))} ${left < 0 ? "over" : "left"}</b><span>this week · plan meals ›</span></a>
    <a class="qt" href="#campus/move"><span class="eyebrow">${svg("bus", 'width="14" height="14"')} Shuttles</span><b>Live in TransLoc</b><span>Jimmy, night rides ›</span></a>
    <div class="qt"><span class="eyebrow">${svg("sun", 'width="14" height="14"')} Weather</span>${wx ? `<b>${wx.t}°F · ${WMO(wx.code)}</b><span>High ${wx.hi}° / low ${wx.lo}°${wx.rain >= 40 ? ` · ${wx.rain}% rain, take an umbrella` : ""}</span>` : `<b>—</b><span>Loading…</span>`}</div>
  </div>

  ${doneSteps < steps.length ? `<div class="setup">
    <div class="setup-head"><div><b>Set up Blue Jay Buddy</b><span class="note">${doneSteps} of ${steps.length} done · each takes under a minute</span></div><div class="ring sm" style="--p:${Math.round(doneSteps / steps.length * 100)}"><span>${doneSteps}/${steps.length}</span></div></div>
    <ul class="setup-steps">${steps.map(s => `<li class="${s.done ? "done" : ""}"><span class="tick">${svg("check")}</span><span class="grow"><b>${esc(s.label)}</b><span>${esc(s.why)}</span></span>${s.done ? "" : `<button class="btn sm ${s.primary ? "primary" : "soft"}" type="button" ${s.attr}>${esc(s.cta)}</button>`}</li>`).join("")}</ul></div>` : ""}

  ${App.S.checklist().length ? `<details class="tile checklist" ${prof?.status === "new" ? "open" : ""}><summary><b>${prof?.status === "new" ? "Your first weeks" : "To-do"}</b><span class="note">${App.S.checklist().filter(c => c.done).length} of ${App.S.checklist().length} done</span></summary>
    <ul class="cl">${App.S.checklist().map(c => `<li class="${c.done ? "done" : ""}"><button class="tick" type="button" data-tick="${c.id}" aria-pressed="${c.done}" aria-label="Mark done: ${esc(c.label)}">${svg("check")}</button><span class="grow">${esc(c.label)}</span>${c.g ? `<button class="mini" type="button" data-guide="${c.g}">How</button>` : ""}</li>`).join("")}</ul></details>` : ""}
  </section>`;
};
})();

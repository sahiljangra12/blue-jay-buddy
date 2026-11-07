// Classes tab: My week · Due · Grades · My program
(() => {
"use strict";
const App = window.App, { esc, svg, fmt, mins, DAY, store } = App;
const P = window.BJB_PROGRAMS;

const SUBS = [["schedule","My week"],["due","Due"],["grades","Grades"],["program","My program"]];
const where = c => c.mode === "online" ? "Online" : `${c.bldg || "Room TBA"}${c.room ? " " + c.room : ""}${c.mode === "hybrid" ? " · hybrid" : ""}`;
App.where = where;
App.classGo = (c, cls = "btn sm") => c.mode === "online"
  ? (c.link ? `<a class="${cls}" href="${esc(App.safeUrl(c.link))}" target="_blank" rel="noopener">${svg("video")}Join</a>` : `<button class="${cls} soft" type="button" data-edit="${c.id}">${svg("video")}Add link</button>`)
  : (c.bldg ? `<a class="${cls}" href="${App.walkTo(c.bldg + ", Johns Hopkins Homewood, Baltimore")}" target="_blank" rel="noopener">${svg("walk")}Walk there</a>` : "");

App.views.classes = sub => {
  sub = SUBS.some(s => s[0] === sub) ? sub : "schedule";
  return `<section class="page">${App.head("Classes")}${App.subnav("classes", SUBS, sub)}${({ schedule, due, grades, program })[sub]()}</section>`;
};

/* ---------- My week ---------- */
function schedule(){
  const cls = App.S.classes, today = new Date().getDay(), real = cls.filter(c => !c.ex);
  const days = [1,2,3,4,5,6].filter(d => d < 6 || cls.some(c => c.days.includes(d)));
  return `
  ${real.length ? "" : `<div class="callout">
      <div><b>Add your classes in 30 seconds</b><p>Upload your SIS schedule (PDF or screenshot) and we'll fill everything in. ${cls.length ? "The classes below are examples." : ""}</p></div>
      <div class="row"><button class="btn primary" type="button" data-import>${svg("upload")}Upload schedule</button><button class="btn soft" type="button" data-addclass>${svg("plus")}Add by hand</button></div></div>`}
  <div class="week">${days.map(d => {
    const list = cls.filter(c => c.days.includes(d)).sort((a, b) => mins(a.start) - mins(b.start));
    return `<div class="day ${d === today ? "is-today" : ""}"><h4>${DAY[d].slice(0, 3)}${d === today ? " · Today" : ""}</h4>
      ${list.length ? list.map(c => `<div class="cls ${c.ex ? "ex" : ""} ${c.mode}">
        <b>${esc(c.name)}</b>
        <span class="tm">${fmt(c.start)}–${fmt(c.end)}</span>
        <span class="loc">${c.mode === "online" ? svg("video", 'width="12" height="12"') : svg("pin", 'width="12" height="12"')}${esc(where(c))}</span>
        <span class="acts">${App.classGo(c, "mini")}<button class="mini" type="button" data-edit="${c.id}">${svg("edit")}Edit</button>${c.code ? `<a class="mini" href="#campus/groups/${encodeURIComponent(c.code)}">${svg("users")}Study group</a>` : ""}</span>
      </div>`).join("") : `<span class="free">Free</span>`}</div>`;
  }).join("")}</div>
  ${real.length ? `<div class="row wrap"><button class="btn soft" type="button" data-import>${svg("upload")}Upload schedule again</button><button class="btn soft" type="button" data-addclass>${svg("plus")}Add a class</button><button class="btn soft" type="button" id="icsBtn">${svg("cal")}Add to my calendar app</button></div>` : ""}`;
}

/* ---------- Due ---------- */
function due(){
  const C = App.canvas, all = App.deadlines(), now = Date.now();
  if (!C.feed && !(C.manual || []).length) return `<div class="callout big">
      <div><b>See every deadline in one list</b><p>Connect Canvas once. You get upcoming, late and graded work here and as alerts. Takes about a minute and needs no password.</p></div>
      <div class="row"><button class="btn primary" type="button" data-canvas>${svg("link")}Connect Canvas</button><button class="btn soft" type="button" data-add-deadline>${svg("plus")}Add a deadline by hand</button></div></div>`;
  const late = all.filter(d => !d.isDone && new Date(d.due) < now && now - new Date(d.due) < 14 * 864e5);
  const week = all.filter(d => !d.isDone && new Date(d.due) >= now && new Date(d.due) < now + 7 * 864e5);
  const later = all.filter(d => !d.isDone && new Date(d.due) >= now + 7 * 864e5).slice(0, 25);
  const done = all.filter(d => d.isDone && now - new Date(d.due) < 7 * 864e5);
  const row = d => {
    const t = new Date(d.due), left = t - now, cls = left < 0 ? "late" : left < 864e5 ? "soon" : "";
    return `<li class="dl ${cls} ${d.isDone ? "done" : ""}">
      <button class="tick" type="button" data-done="${esc(d.uid)}" aria-pressed="${d.isDone}" aria-label="Mark done: ${esc(d.title)}">${svg("check")}</button>
      <div class="dl-main"><b>${esc(d.title)}</b><span>${esc(d.courseShort || d.course || "")}${d.src === "gradescope" ? " · Gradescope" : d.src === "manual" ? " · added by you" : ""}${d.missing ? ' · <em class="bad">Canvas says missing</em>' : ""}</span></div>
      <span class="when ${cls}">${left < 0 ? "Late · " : ""}${App.relTime(d.due)}</span>
      ${d.url ? `<a class="mini" href="${esc(d.url)}" target="_blank" rel="noopener">Open</a>` : ""}
      ${d.src === "manual" ? `<button class="mini" type="button" data-del-deadline="${esc(d.uid)}" aria-label="Delete">${svg("trash")}</button>` : ""}
    </li>`;
  };
  return `
  <div class="toolbar"><span class="note">${C.last ? "Updated " + App.relTime(C.last) : ""}</span>
    <button class="btn sm soft" type="button" data-sync>${svg("refresh")}Refresh</button>
    <button class="btn sm soft" type="button" data-add-deadline>${svg("plus")}Add deadline</button>
    <button class="btn sm ghost" type="button" data-canvas>Canvas settings</button></div>
  ${late.length ? `<h3 class="grp bad">Late (${late.length})</h3><ul class="dls">${late.map(row).join("")}</ul>` : ""}
  <h3 class="grp">Next 7 days (${week.length})</h3>${week.length ? `<ul class="dls">${week.map(row).join("")}</ul>` : `<p class="note">Nothing due in the next 7 days.</p>`}
  ${later.length ? `<h3 class="grp">Later</h3><ul class="dls">${later.map(row).join("")}</ul>` : ""}
  ${done.length ? `<h3 class="grp">Done this week</h3><ul class="dls">${done.map(row).join("")}</ul>` : ""}
  ${store.get("bjb-notify", false) ? "" : `<div class="callout"><div><b>Get alerts</b><p>A heads-up 24 hours before something is due, when work is late, and when grades are posted.</p></div><button class="btn primary" type="button" data-enable-push>${svg("bell")}Turn on alerts</button></div>`}`;
}

/* ---------- Grades ---------- */
function grades(){
  const C = App.canvas;
  if (!C.token) return `<div class="callout big"><div><b>See your grades and late work</b><p>Add a Canvas access token (Account → Settings → New Access Token). It stays on this device. Your deadlines work without it.</p></div>
    <div class="row"><button class="btn primary" type="button" data-canvas>${svg("link")}Add Canvas token</button><a class="btn soft" href="https://www.gradescope.com" target="_blank" rel="noopener">Open Gradescope</a></div></div>`;
  const recent = (C.grades || []).filter(g => g.score != null).sort((a, b) => new Date(b.gradedAt || 0) - new Date(a.gradedAt || 0)).slice(0, 15);
  return `
  <div class="toolbar"><span class="note">${C.last ? "Updated " + App.relTime(C.last) : ""}</span><button class="btn sm soft" type="button" data-sync>${svg("refresh")}Refresh</button></div>
  <div class="grid2">${(C.courses || []).map(c => `<div class="tile">
    <span class="eyebrow">${esc(c.code || "")}</span><b class="t2">${esc(c.name)}</b>
    <span class="score">${c.score != null ? Math.round(c.score * 10) / 10 + "%" : "—"}${c.grade ? ` <small>${esc(c.grade)}</small>` : ""}</span>
    <span class="note">Current score in Canvas (only graded work counts)</span></div>`).join("") || `<p class="note">No active courses found.</p>`}</div>
  <h3 class="grp">Recently graded</h3>
  ${recent.length ? `<ul class="dls">${recent.map(g => `<li class="dl"><div class="dl-main"><b>${esc(g.title)}</b><span>${esc(g.courseShort)}${g.late ? ' · <em class="bad">late</em>' : ""}</span></div>
    <span class="when">${g.score}${g.points ? " / " + g.points : ""}</span>${g.url ? `<a class="mini" href="${esc(g.url)}" target="_blank" rel="noopener">Open</a>` : ""}</li>`).join("")}</ul>` : `<p class="note">No graded work yet.</p>`}
  <p class="note">Gradescope scores show here only when your instructor syncs them to Canvas. <a href="https://www.gradescope.com" target="_blank" rel="noopener">Open Gradescope</a></p>`;
}

/* ---------- My program (requirement tracker) ---------- */
App.taken = Object.assign({}, store.get("bjb-taken", {})); // code -> "done" | "now" | "plan"
const saveTaken = () => store.set("bjb-taken", App.taken);
App.markTakingFromClasses = () => { App.S.classes.forEach(c => { if (c.code && !App.taken[c.code]) App.taken[c.code] = "now"; }); saveTaken(); };

// Assign each counted course to at most one slot, filling as many slots as possible (backtracking, small n).
function allocate(slots, courses){
  const order = ["done","now","plan"];
  const pool = Object.entries(courses).sort((a, b) => order.indexOf(a[1]) - order.indexOf(b[1])).map(([c]) => c);
  let best = { n: -1, map: {} };
  const used = new Set(), map = {};
  (function rec(i, n){
    if (n + (slots.length - i) <= best.n) return;
    if (i === slots.length){ if (n > best.n) best = { n, map: Object.assign({}, map) }; return; }
    const s = slots[i];
    for (const c of pool){ if (!used.has(c) && s.from.includes(c)){ used.add(c); map[s.id] = c; rec(i + 1, n + 1); used.delete(c); delete map[s.id]; } }
    rec(i + 1, n);
  })(0, 0);
  return best.map;
}
function program(){
  const prof = App.S.profile || {};
  const prog = P.list.find(p => p.id === prof.program);
  if (!prog) return `<div class="callout big"><div><b>Track your degree requirements</b><p>Pick your program to see core courses, electives and what's left. Programs are added from the official JHU catalogue.</p></div>
    <div class="form">
      <label class="field">Your program<select id="progPick"><option value="">Choose…</option>${P.list.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></label>
      <p class="note">Don't see yours? <a href="mailto:${App.D.contact}?subject=${encodeURIComponent("Add my program to Blue Jay Buddy")}">Ask for it</a> and include the e-catalogue link.</p>
    </div></div>`;
  const plan = prog.plans.find(p => p.id === prof.plan) || prog.plans[0];
  const map = allocate(plan.slots, App.taken);
  const status = c => App.taken[c] || "";
  const filled = plan.slots.filter(s => map[s.id]);
  const doneN = filled.filter(s => status(map[s.id]) === "done").length, nowN = filled.filter(s => status(map[s.id]) === "now").length;
  const T = c => P.titles[c] ? P.titles[c][0] : c, CR = c => P.titles[c] ? P.titles[c][1] : "";
  const pct = Math.round(doneN / plan.slots.length * 100);
  const extra = Object.keys(App.taken).filter(c => !Object.values(map).includes(c) && App.taken[c]);
  return `
  <div class="prog-head">
    <div><span class="eyebrow">${esc(prog.dept)}</span><h3 class="h3">${esc(prog.name)}</h3>
      <label class="inline">Plan <select id="planPick">${prog.plans.map(p => `<option value="${p.id}" ${p.id === plan.id ? "selected" : ""}>${esc(p.label)}</option>`).join("")}</select></label></div>
    <div class="ring" style="--p:${pct}"><span>${doneN}/${plan.slots.length}</span><small>done</small></div>
  </div>
  <p class="note">${doneN} done · ${nowN} this term · ${plan.slots.length - filled.length} still to choose. Tap a requirement to pick a course. <a href="${esc(prog.source)}" target="_blank" rel="noopener">Official requirements</a> (checked ${App.monthLabel(prog.checked)}).</p>
  <ul class="reqs">${plan.slots.map(s => {
    const c = map[s.id], st = c ? status(c) : "";
    return `<li class="req ${st || "open"}"><button type="button" data-slot="${s.id}">
      <span class="req-st">${st === "done" ? svg("check") : st === "now" ? svg("clock") : st === "plan" ? svg("flag") : ""}</span>
      <span class="req-main"><b>${esc(s.label)}</b><span>${c ? `${esc(c)} · ${esc(T(c))} (${CR(c)} cr) · ${st === "done" ? "completed" : st === "now" ? "taking now" : "planned"}` : `Choose from ${s.from.length} course${s.from.length > 1 ? "s" : ""}`}</span>${s.note ? `<em>${esc(s.note)}</em>` : ""}</span>
      <span class="chev">›</span></button></li>`;
  }).join("")}</ul>
  ${extra.length ? `<p class="note">Also on your list (not counted toward a slot): ${extra.map(c => esc(c)).join(", ")}</p>` : ""}
  <h3 class="grp">Also required</h3><ul class="bul">${prog.extras.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
  <h3 class="grp">Rules</h3><ul class="bul">${prog.rules.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
  <p class="note">This tracker helps you plan; your advisor and SIS degree audit are the official record.</p>`;
}

function slotSheet(slotId){
  const prog = P.list.find(p => p.id === App.S.profile.program), plan = prog.plans.find(p => p.id === App.S.profile.plan) || prog.plans[0];
  const s = plan.slots.find(x => x.id === slotId);
  const T = c => P.titles[c] || [c, ""];
  App.openSheet(`${App.sheetHead(esc(s.label), "Mark what you've done, are taking, or plan to take. Tap “Terms” to see when a course is offered.")}
    <input class="filter" id="slotFilter" placeholder="Filter courses" aria-label="Filter courses">
    <ul class="pick" id="slotList">${s.from.map(c => `<li data-c="${c}" data-s="${esc((c + " " + T(c)[0]).toLowerCase())}">
      <div><b>${esc(c)}</b> ${esc(T(c)[0])} <span class="note">${T(c)[1]} cr</span><span class="terms" id="t-${c.replace(/\./g, "")}"></span></div>
      <div class="seg3">${["done","now","plan"].map(v => `<button type="button" class="${App.taken[c] === v ? "on" : ""}" data-take="${c}" data-v="${v}">${v === "done" ? "Done" : v === "now" ? "Taking" : "Plan"}</button>`).join("")}
      <button type="button" class="ghost" data-terms="${c}">Terms</button></div></li>`).join("")}</ul>`, "tall");
}
async function showTerms(code){
  const el = App.$("#t-" + code.replace(/\./g, ""));
  if (!el) return;
  if (!App.S.hasServer) { el.innerHTML = ` · <a href="https://sis.jhu.edu/classes/" target="_blank" rel="noopener">Check in SIS class search</a>`; return; }
  el.textContent = " · checking…";
  try {
    const r = await App.api(`/api/sis?course=${encodeURIComponent(code)}`);
    el.innerHTML = r.terms?.length ? ` · Offered: ${r.terms.map(esc).join(", ")}` : r.error ? ` · <a href="https://sis.jhu.edu/classes/" target="_blank" rel="noopener">Check in SIS</a>` : " · Not offered in recent terms";
  } catch { el.innerHTML = ` · <a href="https://sis.jhu.edu/classes/" target="_blank" rel="noopener">Check in SIS class search</a>`; }
}

/* ---------- add / edit a class ---------- */
App.classSheet = (c = null) => {
  const v = c || { mode: "inperson", days: [], start: "09:00", end: "10:15", bldg: "", room: "", link: "", code: "" };
  App.openSheet(`${App.sheetHead(c && !c.ex ? "Edit class" : "Add a class")}
  <form class="form" id="classForm" data-id="${c && !c.ex ? c.id : ""}">
    <div class="row2"><label class="field">Course code <span class="note">optional</span><input name="code" placeholder="EN.553.613" value="${esc(v.code || "")}" maxlength="14"></label>
    <label class="field">Name<input name="name" required maxlength="70" value="${esc(c && !c.ex ? v.name : "")}" placeholder="e.g. Applied Statistics"></label></div>
    <div class="seg" role="radiogroup" aria-label="How it meets">${[["inperson","In person"],["online","Online"],["hybrid","Hybrid"]].map(([m, l]) => `<label><input type="radio" name="mode" value="${m}" ${v.mode === m ? "checked" : ""}><span>${l}</span></label>`).join("")}</div>
    <div class="days" role="group" aria-label="Days">${["Mon","Tue","Wed","Thu","Fri","Sat"].map((d, i) => `<label><input type="checkbox" name="days" value="${i+1}" ${v.days.includes(i+1) ? "checked" : ""}><span>${d}</span></label>`).join("")}</div>
    <div class="row2"><label class="field">Starts<input name="start" type="time" required value="${esc(v.start)}"></label><label class="field">Ends<input name="end" type="time" required value="${esc(v.end)}"></label></div>
    <div class="row2"><label class="field">Building<select name="bldg"><option value="">—</option>${App.D.buildings.map(([b]) => `<option ${b === v.bldg ? "selected" : ""}>${esc(b)}</option>`).join("")}</select></label>
    <label class="field">Room<input name="room" maxlength="12" value="${esc(v.room || "")}"></label></div>
    <label class="field">Meeting link <span class="note">for online or hybrid</span><input name="link" type="url" value="${esc(v.link || "")}" placeholder="https://jhubluejays.zoom.us/j/…"></label>
    <div class="row"><button class="btn primary" type="submit">${svg("check")}Save</button>${c && !c.ex ? `<button class="btn ghost danger" type="button" data-delclass="${c.id}">${svg("trash")}Delete</button>` : ""}</div>
  </form>`);
};

App.exportICS = () => {
  const real = App.S.classes.filter(c => !c.ex);
  if (!real.length) { App.toast("Add your classes first"); return; }
  const pad = n => String(n).padStart(2, "0"), BY = ["SU","MO","TU","WE","TH","FR","SA"];
  const now = new Date(), stamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const ev = real.map(c => {
    const first = new Date(now); const d0 = Math.min(...c.days.map(d => (d - now.getDay() + 7) % 7)); first.setDate(now.getDate() + d0);
    const ymd = `${first.getFullYear()}${pad(first.getMonth()+1)}${pad(first.getDate())}`;
    const [sh, sm] = c.start.split(":"), [eh, em] = c.end.split(":");
    return ["BEGIN:VEVENT", `UID:${c.id}@bluejaybuddy`, `DTSTAMP:${stamp}`, `DTSTART;TZID=America/New_York:${ymd}T${sh}${sm}00`, `DTEND;TZID=America/New_York:${ymd}T${eh}${em}00`,
      `RRULE:FREQ=WEEKLY;COUNT=16;BYDAY=${c.days.map(d => BY[d]).join(",")}`, `SUMMARY:${c.name}`, `LOCATION:${where(c)}`, c.link ? `URL:${c.link}` : "", "END:VEVENT"].filter(Boolean).join("\r\n");
  });
  const blob = new Blob([["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Blue Jay Buddy//EN", ...ev, "END:VCALENDAR"].join("\r\n")], { type: "text/calendar" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "my-classes.ics"; a.click();
  App.toast("Calendar file downloaded. Open it to add your classes.");
};

document.addEventListener("submit", e => {
  if (e.target.id !== "classForm") return;
  e.preventDefault();
  const f = new FormData(e.target), id = e.target.dataset.id;
  const days = f.getAll("days").map(Number);
  if (!days.length) { App.toast("Pick at least one day"); return; }
  const raw = (f.get("code") || "").toUpperCase().replace(/\s+/g, "");
  const m = raw.match(/^([A-Z]{2})\.?(\d{3})\.?(\d{3})/);
  const c = { id: id ? +id : Date.now(), code: m ? `${m[1]}.${m[2]}.${m[3]}` : "", name: f.get("name").trim(), mode: f.get("mode"), days, start: f.get("start"), end: f.get("end"), bldg: f.get("bldg"), room: f.get("room").trim(), link: f.get("link").trim() };
  App.S.classes = App.S.classes.filter(x => !x.ex && String(x.id) !== String(c.id)).concat(c);
  App.saveClasses(); App.markTakingFromClasses(); App.closeSheet(); App.toast("Saved"); App.render();
});
document.addEventListener("change", e => {
  if (e.target.id === "progPick" && e.target.value){ App.S.profile = Object.assign(App.S.profile || {}, { program: e.target.value, plan: "" }); App.saveProfile(); App.markTakingFromClasses(); App.S.setupStep("program"); App.render(); }
  if (e.target.id === "planPick"){ App.S.profile.plan = e.target.value; App.saveProfile(); App.render(); }
});
document.addEventListener("input", e => {
  if (e.target.id === "slotFilter"){ const q = e.target.value.toLowerCase(); App.$$("#slotList li").forEach(li => li.hidden = !li.dataset.s.includes(q)); }
});
document.addEventListener("click", e => {
  const t = e.target;
  if (t.closest("[data-addclass]")) { e.preventDefault(); App.classSheet(); }
  const ed = t.closest("[data-edit]"); if (ed) App.classSheet(App.S.classes.find(c => String(c.id) === ed.dataset.edit));
  const del = t.closest("[data-delclass]"); if (del){ App.S.classes = App.S.classes.filter(c => String(c.id) !== del.dataset.delclass); App.saveClasses(); App.closeSheet(); App.render(); }
  if (t.id === "icsBtn") App.exportICS();
  const sl = t.closest("[data-slot]"); if (sl) slotSheet(sl.dataset.slot);
  const tk = t.closest("[data-take]"); if (tk){ const c = tk.dataset.take, v = tk.dataset.v; App.taken[c] = App.taken[c] === v ? "" : v; if (!App.taken[c]) delete App.taken[c]; saveTaken();
    tk.parentElement.querySelectorAll("[data-take]").forEach(b => b.classList.toggle("on", App.taken[c] === b.dataset.v)); App.render(); }
  const tm = t.closest("[data-terms]"); if (tm) showTerms(tm.dataset.terms);
  if (t.closest("[data-enable-push]")) { App.enablePush().then(() => { App.S.setupStep("alerts"); App.render(); }); }
});
})();

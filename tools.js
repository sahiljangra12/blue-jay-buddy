// Extra tools: study toolkit (GPA, final grade, focus timer), offline emergency card with contact download,
// live shuttle map, event calendar export, backup and restore, display options and "What's new".
// Uses helpers that app.js exposes on window.BJB_APP.
(() => {
"use strict";
const A = () => window.BJB_APP;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const download = (name, text, type) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
const top = (eyebrow, title) => `<div class="wiz-top"><span class="eyebrow">${eyebrow}</span><button class="iconx" type="button" data-close aria-label="Close">${A().svg("close")}</button></div><h2 id="sheetTitle">${title}</h2>`;

/* ================= Study toolkit ================= */
// Quality points from the JHU Registrar's transcript guide (Arts & Sciences and Engineering, undergraduate).
const POINTS = { "A+":4, "A":4, "A-":3.7, "B+":3.3, "B":3, "B-":2.7, "C+":2.3, "C":2, "C-":1.7, "D+":1.3, "D":1, "F":0 };
let toolTab = "gpa";
function gpaRows(){ return get("bjb-gpa", [{ c: "", cr: 3, g: "A" }, { c: "", cr: 3, g: "A-" }, { c: "", cr: 4, g: "B+" }]); }
function gpaCalc(rows){ let q = 0, cr = 0; rows.forEach(r => { const n = +r.cr; if (n > 0 && r.g in POINTS){ q += n * POINTS[r.g]; cr += n; } }); return cr ? { gpa: (Math.floor(q / cr * 100 + 1e-9) / 100).toFixed(2), cr } : null; }
function gpaHTML(){
  const rows = gpaRows(), r = gpaCalc(rows);
  return `<div class="gpa"><div class="gpa-rows">${rows.map((x, i) => `<div class="gpa-row">
      <label class="sr-only" for="gc${i}">Course ${i + 1}</label><input id="gc${i}" data-gpa="c" data-i="${i}" placeholder="Course ${i + 1}" value="${esc(x.c)}">
      <label class="sr-only" for="gr${i}">Credits</label><input id="gr${i}" data-gpa="cr" data-i="${i}" type="number" min="0" max="8" step="0.5" value="${esc(x.cr)}" inputmode="decimal" aria-label="Credits">
      <label class="sr-only" for="gg${i}">Grade</label><select id="gg${i}" data-gpa="g" data-i="${i}" aria-label="Grade">${Object.keys(POINTS).map(g => `<option ${g === x.g ? "selected" : ""}>${g}</option>`).join("")}</select>
      <button class="iconx sm" type="button" data-gpa-del="${i}" aria-label="Remove course ${i + 1}">${A().svg("close")}</button></div>`).join("")}</div>
    <button class="pill secondary" type="button" data-gpa-add>${A().svg("plus")}Add a course</button>
    <div class="result" aria-live="polite">${r ? `<span class="big-num">${r.gpa}</span><span>term GPA · ${r.cr} credits</span>` : `<span>Add credits and grades.</span>`}</div>
    <p class="note">Uses the Registrar's scale: A+ and A = 4.0, A− = 3.7, B+ = 3.3 … F = 0. Graduate courses in Arts & Sciences and Engineering don't carry a GPA. Your official GPA is in SIS.</p></div>`;
}
function finalHTML(){
  const f = get("bjb-final", { cur: 88, w: 30, want: 90 });
  const w = +f.w / 100, need = w > 0 ? (+f.want - +f.cur * (1 - w)) / w : NaN;
  const msg = !isFinite(need) ? "Enter a final weight above 0." : need <= 0 ? "You already have it, even with a 0 on the final." : need > 100 ? `You'd need ${need.toFixed(1)}%, more than 100%.` : `You need <b>${need.toFixed(1)}%</b> on the final.`;
  return `<div class="final">
    <label>Current grade before the final (%)<input data-final="cur" type="number" inputmode="decimal" min="0" max="120" value="${esc(f.cur)}"></label>
    <label>Final exam weight (% of the course)<input data-final="w" type="number" inputmode="decimal" min="0" max="100" value="${esc(f.w)}"></label>
    <label>Grade you want overall (%)<input data-final="want" type="number" inputmode="decimal" min="0" max="120" value="${esc(f.want)}"></label>
    <div class="result" aria-live="polite"><span>${msg}</span></div>
    <p class="note">Check your syllabus for each part's weight and the cutoff for each letter grade.</p></div>`;
}
/* Focus timer: keeps running while you use the rest of the app. */
const timer = { mode: "focus", left: 25 * 60, running: false, t: null, rounds: 0 };
const LEN = { focus: 25 * 60, break: 5 * 60, long: 15 * 60 };
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
function tick(){
  timer.left--;
  if (timer.left <= 0){
    if (timer.mode === "focus"){ timer.rounds++; set("bjb-focus-today", { d: new Date().toDateString(), n: focusToday() + 1 }); }
    const next = timer.mode === "focus" ? (timer.rounds % 4 === 0 ? "long" : "break") : "focus";
    const msg = next === "focus" ? "Break's over. Back to it." : "Nice work. Take a break.";
    try { if (Notification.permission === "granted") new Notification("Blue Jay Buddy", { body: msg, icon: "assets/icon-192.png" }); } catch {}
    A().toast(msg); try { navigator.vibrate?.(200); } catch {}
    timer.mode = next; timer.left = LEN[next];
  }
  paintTimer();
}
function focusToday(){ const f = get("bjb-focus-today", { d: "", n: 0 }); return f.d === new Date().toDateString() ? f.n : 0; }
function paintTimer(){
  const el = document.getElementById("tmr"); if (el){ el.textContent = mmss(timer.left); }
  const lab = document.getElementById("tmrMode"); if (lab) lab.textContent = timer.mode === "focus" ? "Focus" : timer.mode === "long" ? "Long break" : "Break";
  const btn = document.getElementById("tmrBtn"); if (btn) btn.innerHTML = timer.running ? "Pause" : "Start";
  const cnt = document.getElementById("tmrCount"); if (cnt) cnt.textContent = `${focusToday()} focus session${focusToday() === 1 ? "" : "s"} today`;
  document.title = timer.running ? `${mmss(timer.left)} · ${timer.mode === "focus" ? "Focus" : "Break"}` : "Blue Jay Buddy";
}
function timerHTML(){
  return `<div class="timer"><span class="eyebrow" id="tmrMode">Focus</span><span class="timer-num" id="tmr" role="timer" aria-live="off">${mmss(timer.left)}</span>
    <div class="sheet-actions"><button class="pill primary" id="tmrBtn" type="button" data-tmr="toggle">${timer.running ? "Pause" : "Start"}</button><button class="pill ghost" type="button" data-tmr="reset">Reset</button><button class="pill ghost" type="button" data-tmr="skip">Skip</button></div>
    <p class="note" id="tmrCount"></p>
    <p class="note">25 minutes of focus, then a 5-minute break; every fourth break is 15 minutes. It keeps running while you use the rest of the app.</p></div>`;
}
function toolsSheet(tab = toolTab){
  toolTab = tab;
  const T = [["gpa", "GPA"], ["final", "Final grade"], ["timer", "Focus timer"]];
  A().openSheet(`${top("Study tools", "Study tools")}
    <div class="seg" role="tablist" aria-label="Tools">${T.map(([id, l]) => `<button type="button" role="tab" aria-selected="${id === tab}" data-tooltab="${id}">${l}</button>`).join("")}</div>
    <div id="toolBody">${tab === "gpa" ? gpaHTML() : tab === "final" ? finalHTML() : timerHTML()}</div>`);
  paintTimer();
}

/* ================= Emergency card ================= */
// Every number here was checked on an official Johns Hopkins page (see data.js).
const SOS = [
  ["Campus emergency (Homewood)", "410-516-7777", "Fire, medical or police emergency on campus. Or dial 911."],
  ["Emergency (anywhere)", "911", ""],
  ["Safety escort", "410-516-4600", "A walking or vehicle escort on or around campus."],
  ["Night Ride (Blue Jay Shuttle)", "410-516-8700", "Requests from 6 PM; made before 2 AM are honored."],
  ["Behavioral Health Crisis Support (24/7)", "410-516-9355", "Mental health crisis, any time."],
  ["Sexual Assault Helpline (24/7)", "410-516-7333", "Confidential."],
  ["Student Health & Mental Health Services", "410-516-3311", "Appointments; after hours connects to a clinician."],
  ["988 Suicide & Crisis Lifeline", "988", "Call or text."],
  ["Maryland Poison Center", "800-222-1222", ""],
  ["IT Help Desk (24/7)", "410-516-4357", ""],
  ["Weather emergency line", "410-516-7781", "Closures and delays."],
];
function sosSheet(){
  A().openSheet(`${top("Works offline", "Emergency card")}
    <p class="note">Install Blue Jay Buddy on your home screen and this card opens even without signal. Calls ask before dialing.</p>
    <ul class="sos-list">${SOS.map(([t, p, d]) => `<li><div><b>${esc(t)}</b>${d ? `<span>${esc(d)}</span>` : ""}</div><a class="mini call" href="tel:${p.replace(/\D/g, "")}" data-label="${esc(t)}" data-num="${esc(p)}">${A().svg("phone")}${esc(p)}</a></li>`).join("")}</ul>
    <div class="sheet-actions"><button class="pill primary" type="button" data-sos-vcf>${A().svg("download")}Save all to my contacts</button></div>
    <p class="note">Downloads one contact card file. Open it on your phone to add the numbers.</p>`);
}
function sosVCF(){
  const cards = SOS.filter(([, p]) => p.length > 3).map(([t, p]) => ["BEGIN:VCARD", "VERSION:3.0", `FN:JHU ${t.replace(/[,;]/g, " ")}`, `N:${t.replace(/[,;]/g, " ")};JHU;;;`, `ORG:Johns Hopkins (via Blue Jay Buddy)`, `TEL;TYPE=VOICE:+1${p.replace(/\D/g, "")}`, "END:VCARD"].join("\r\n"));
  download("jhu-safety-numbers.vcf", cards.join("\r\n"), "text/vcard");
  A().toast("Contact file downloaded");
}

/* ================= Live shuttle map ================= */
const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
let map = null, layer = null, mapTimer = null, routesCache = null;
const loadLeaflet = () => window.L ? Promise.resolve() : new Promise((ok, bad) => {
  const c = document.createElement("link"); c.rel = "stylesheet"; c.href = LEAFLET_CSS; document.head.appendChild(c);
  const s = document.createElement("script"); s.src = LEAFLET_JS; s.onload = ok; s.onerror = () => bad(new Error("map")); document.head.appendChild(s);
});
function decode(str){ // Google encoded polyline
  let i = 0, lat = 0, lng = 0; const out = [];
  while (i < str.length){
    for (const k of [0, 1]){ let b, sh = 0, r = 0; do { b = str.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32); const d = r & 1 ? ~(r >> 1) : r >> 1; if (k) lng += d; else lat += d; }
    out.push([lat / 1e5, lng / 1e5]);
  }
  return out;
}
async function routes(){
  if (routesCache) return routesCache;
  const r = await fetch("https://jhu.transloc.com/Services/JSONPRelay.svc/GetRoutesForMapWithScheduleWithEncodedLine?apiKey=8882812681&isDispatch=false");
  return routesCache = await r.json();
}
async function drawMap(routeId){
  const box = document.getElementById("shuttleMap"); if (!box) return;
  try {
    await loadLeaflet();
    if (!map || !document.body.contains(map.getContainer())){
      map = window.L.map(box, { zoomControl: true, attributionControl: true }).setView([39.3299, -76.6205], 14);
      window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap contributors" }).addTo(map);
    }
    if (layer) layer.remove(); layer = window.L.layerGroup().addTo(map);
    const all = await routes().catch(() => []);
    const r = (all || []).find(x => x.RouteID === routeId);
    const color = r?.MapLineColor || "#1D64B8";
    if (r?.EncodedPolyline){ const line = window.L.polyline(decode(r.EncodedPolyline), { color, weight: 4, opacity: .8 }).addTo(layer); if (!box.dataset.fit) { map.fitBounds(line.getBounds(), { padding: [20, 20] }); } }
    (r?.Stops || []).forEach(s => s.Latitude && window.L.circleMarker([s.Latitude, s.Longitude], { radius: 5, color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 }).bindTooltip(esc((s.Description || s.Name || "").replace(/\s*\(\d+\)\s*$/, ""))).addTo(layer));
    const v = await fetch("https://jhu.transloc.com/Services/JSONPRelay.svc/GetMapVehiclePoints?apiKey=8882812681&isPublicMap=true").then(x => x.json()).catch(() => []);
    v.filter(x => x.RouteID === routeId && x.Latitude).forEach(x => window.L.marker([x.Latitude, x.Longitude], { icon: window.L.divIcon({ className: "bus-pin", html: `<span style="--c:${esc(color)}">🚌</span>`, iconSize: [30, 30] }), title: "Shuttle " + (x.Name || "") }).addTo(layer));
    box.dataset.fit = "1";
    setTimeout(() => map.invalidateSize(), 50);
  } catch {
    box.innerHTML = `<p class="note">Couldn't load the map. Open the <a href="https://jhu.transloc.com" target="_blank" rel="noopener">shuttle tracker</a>.</p>`;
  }
}
function toggleMap(routeId){
  const box = document.getElementById("shuttleMap"), btn = document.querySelector("[data-shuttlemap]");
  if (!box) return;
  const show = box.hidden; box.hidden = !show; btn?.setAttribute("aria-pressed", show);
  clearInterval(mapTimer);
  if (show){ box.dataset.fit = ""; drawMap(routeId); mapTimer = setInterval(() => document.getElementById("shuttleMap") && !document.getElementById("shuttleMap").hidden ? drawMap(window.BJB_APP.route()) : clearInterval(mapTimer), 15000); }
}

/* ================= Events: add to calendar ================= */
function eventICS(e){
  const z = iso => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const clean = s => String(s || "").replace(/[,;\\]/g, " ").replace(/\n/g, " ");
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Blue Jay Buddy//Events//EN", "BEGIN:VEVENT", `UID:bjb-ev-${z(e.s)}-${clean(e.t).replace(/\W/g, "").slice(0, 20)}@bluejaybuddy`, `DTSTAMP:${z(new Date().toISOString())}`,
    `DTSTART:${z(e.s)}`, `DTEND:${z(e.e || e.s)}`, `SUMMARY:${clean(e.t)}`, `DESCRIPTION:${clean(e.h)}${e.u ? " · RSVP: " + e.u : ""}`, e.u ? `URL:${e.u}` : "",
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${clean(e.t)} starts in 30 minutes`, "TRIGGER:-PT30M", "END:VALARM", "END:VEVENT", "END:VCALENDAR"];
  download("event.ics", L.filter(Boolean).join("\r\n"), "text/calendar");
  A().toast("Event added with a 30-minute reminder");
}

/* ================= Backup, display, what's new ================= */
const KEYS = ["bjb-profile", "bjb-favs", "bjb-done", "bjb-classes", "bjb-until", "bjb-due", "bjb-theme", "bjb-route", "bjb-food", "bjb-gpa", "bjb-final", "bjb-text", "bjb-contrast", "bjb-evcat"];
function backup(){
  const data = {}; KEYS.forEach(k => { const v = localStorage.getItem(k); if (v !== null) data[k] = v; });
  if (data["bjb-due"]) { try { const d = JSON.parse(data["bjb-due"]); d.feed = ""; data["bjb-due"] = JSON.stringify(d); } catch {} }
  download(`blue-jay-buddy-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ app: "blue-jay-buddy", v: 1, data }, null, 1), "application/json");
  A().toast("Backup downloaded. Your Canvas link is left out for safety.");
}
function restore(file){
  file.text().then(t => {
    const j = JSON.parse(t); if (j.app !== "blue-jay-buddy" || !j.data) throw 0;
    Object.entries(j.data).forEach(([k, v]) => KEYS.includes(k) && typeof v === "string" && localStorage.setItem(k, v));
    A().toast("Restored. Reloading…"); setTimeout(() => location.reload(), 700);
  }).catch(() => A().toast("That file isn't a Blue Jay Buddy backup"));
}
function applyDisplay(){
  const r = document.documentElement;
  r.dataset.text = get("bjb-text", "normal");
  get("bjb-contrast", false) ? r.setAttribute("data-contrast", "high") : r.removeAttribute("data-contrast");
}
function displayHTML(){
  const t = get("bjb-text", "normal"), c = get("bjb-contrast", false);
  return `<h3 class="subhead">Display</h3>
    <div class="seg" role="group" aria-label="Text size">${[["normal", "Text: normal"], ["large", "Large"], ["xl", "Extra large"]].map(([v, l]) => `<button type="button" aria-pressed="${t === v}" data-textsize="${v}">${l}</button>`).join("")}</div>
    <label class="switch"><input type="checkbox" data-hicontrast ${c ? "checked" : ""}><span>High contrast</span></label>
    <h3 class="subhead">Move to a new phone</h3>
    <div class="sheet-actions" style="flex-wrap:wrap"><button class="pill secondary" type="button" data-backup>${A().svg("download")}Download a backup</button>
    <label class="pill secondary file-pill">${A().svg("upload")}Restore a backup<input type="file" accept="application/json,.json" data-restore hidden></label></div>
    <p class="note">The backup is a file with your plan, classes, deadlines and settings. Keep it private.</p>
    <button class="linkbtn" type="button" data-whatsnew>What's new in Blue Jay Buddy</button>`;
}
const NEWS = [
  ["Nov 2026", ["Every phone number, address, hour and date re-checked against current Johns Hopkins pages, including the new students.jhu.edu site.", "Rec center Fall 2026 and Thanksgiving hours; J-Card Office now at the Campus Store.", "Study tools: GPA, final-grade calculator and a focus timer.", "Emergency card that works offline, with a one-tap contact download.", "Live shuttle map, events by type with add-to-calendar, and a leave-by time for your next class.", "Larger text, high contrast, and backup and restore."]],
  ["Nov 2026", ["Live weather with class-time rain alerts, live shuttle arrivals, campus events with a free-food filter, key semester dates, and deadline reminders."]],
  ["Oct 2026", ["New look, Today screen that changes with the time of day, schedule upload, Canvas deadlines, open-now labels."]],
];
function whatsNew(){
  A().openSheet(`${top("Updates", "What's new")}${NEWS.map(([d, l]) => `<h3 class="subhead">${d}</h3><ul class="bul">${l.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`).join("")}
    <p class="note">Spotted something wrong? <a href="mailto:sfnu1@jh.edu?subject=Blue%20Jay%20Buddy%20correction">Tell me</a> and it gets fixed.</p>`);
}

/* ================= events ================= */
document.addEventListener("click", e => {
  const T = s => e.target.closest(s); let el;
  if ((el = T("[data-tools]"))){ toolsSheet(el.dataset.tools || toolTab); return; }
  if ((el = T("[data-tooltab]"))){ toolsSheet(el.dataset.tooltab); return; }
  if ((el = T("[data-gpa-add]"))){ const r = gpaRows(); r.push({ c: "", cr: 3, g: "A" }); set("bjb-gpa", r); toolsSheet("gpa"); return; }
  if ((el = T("[data-gpa-del]"))){ const r = gpaRows(); r.splice(+el.dataset.gpaDel, 1); set("bjb-gpa", r); toolsSheet("gpa"); return; }
  if ((el = T("[data-tmr]"))){
    const a = el.dataset.tmr;
    if (a === "toggle"){ timer.running = !timer.running; clearInterval(timer.t); if (timer.running){ timer.t = setInterval(tick, 1000); try { Notification.permission === "default" && Notification.requestPermission(); } catch {} } }
    if (a === "reset"){ timer.running = false; clearInterval(timer.t); timer.mode = "focus"; timer.left = LEN.focus; }
    if (a === "skip"){ timer.left = 1; if (!timer.running){ tick(); } }
    paintTimer(); return;
  }
  if ((el = T("[data-sos]"))){ sosSheet(); return; }
  if ((el = T("[data-sos-vcf]"))){ sosVCF(); return; }
  if ((el = T("[data-shuttlemap]"))){ toggleMap(A().route()); return; }
  if ((el = T("[data-ev-ics]"))){ e.preventDefault(); const ev = (A().events() || [])[+el.dataset.evIcs]; if (ev) eventICS(ev); return; }
  if ((el = T("[data-backup]"))){ backup(); return; }
  if ((el = T("[data-whatsnew]"))){ whatsNew(); return; }
  if ((el = T("[data-textsize]"))){ set("bjb-text", el.dataset.textsize); applyDisplay(); document.querySelectorAll("[data-textsize]").forEach(b => b.setAttribute("aria-pressed", b === el)); return; }
}, true);
document.addEventListener("input", e => {
  const t = e.target;
  if (t.dataset.gpa){ const r = gpaRows(); r[+t.dataset.i][t.dataset.gpa] = t.value; set("bjb-gpa", r); const res = gpaCalc(r); const box = t.closest(".gpa")?.querySelector(".result"); if (box) box.innerHTML = res ? `<span class="big-num">${res.gpa}</span><span>term GPA · ${res.cr} credits</span>` : `<span>Add credits and grades.</span>`; }
  if (t.dataset.final){ const f = get("bjb-final", { cur: 88, w: 30, want: 90 }); f[t.dataset.final] = t.value; set("bjb-final", f); const body = document.getElementById("toolBody"); const pos = t.dataset.final; body.innerHTML = finalHTML(); const n = body.querySelector(`[data-final="${pos}"]`); n.focus(); try { n.setSelectionRange(n.value.length, n.value.length); } catch {} }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.matches("[data-hicontrast]")){ set("bjb-contrast", t.checked); applyDisplay(); }
  if (t.matches("[data-restore]") && t.files[0]) restore(t.files[0]);
});
applyDisplay();
window.BJB_TOOLS = { toolsSheet, sosSheet, displayHTML, drawMap, toggleMap };
})();

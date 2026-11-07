// Canvas: deadlines from the student's private Canvas calendar feed, optional grades with a
// personal access token, alert generation, and push-alert sign-up.
(() => {
"use strict";
const App = window.App, { esc, svg, store } = App;

/* ---------- ICS parsing ---------- */
function unfold(ics){ return ics.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, ""); }
function icsDate(v){
  if (!v) return null;
  const m = v.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (!m) return null;
  if (!m[4]) return new Date(+m[1], m[2] - 1, +m[3], 23, 59); // all-day: treat as end of day
  return m[7] ? new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6])) : new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
}
const txt = s => (s || "").replace(/\\n/g, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\").trim();
App.parseICS = ics => {
  const out = [];
  unfold(ics).split("BEGIN:VEVENT").slice(1).forEach(block => {
    const get = k => { const m = block.match(new RegExp("^" + k + "(?:;[^:\\n]*)?:(.*)$", "m")); return m ? m[1].trim() : ""; };
    const summary = txt(get("SUMMARY")), uid = get("UID"), url = get("URL");
    const due = icsDate(get("DTSTART"));
    if (!summary || !due) return;
    // Canvas puts the course in brackets: "Homework 3 [EN.553.613.01.FA26 Applied Stats]"
    const cm = summary.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
    const title = cm ? cm[1] : summary, course = cm ? cm[2] : "";
    const isAssignment = /assignment/i.test(uid) || /assignment/i.test(url);
    out.push({ uid: uid || summary + due.toISOString(), title, course, courseShort: shortCourse(course), due: due.toISOString(), url, kind: isAssignment ? "assignment" : "event", src: /gradescope/i.test(summary + url) ? "gradescope" : "canvas" });
  });
  return out.sort((a, b) => new Date(a.due) - new Date(b.due));
};
function shortCourse(c){
  const m = c.match(/([A-Z]{2})\.?(\d{3})\.?(\d{3})/);
  return m ? `${m[2]}.${m[3]}` : c.split(/\s+/).slice(0, 3).join(" ");
}

/* ---------- state ---------- */
const C = App.canvas = Object.assign({ feed: "", token: "", items: [], grades: [], courses: [], last: 0, manual: [], done: [] }, store.get("bjb-canvas", {}));
const save = () => store.set("bjb-canvas", C);
App.saveCanvas = save;

App.deadlines = () => {
  const done = new Set(C.done || []);
  return [...C.items.filter(i => i.kind === "assignment" || /due|quiz|exam|homework|hw|project|lab|essay|report|midterm|final/i.test(i.title)), ...(C.manual || [])]
    .map(i => Object.assign({}, i, { isDone: done.has(i.uid) || !!i.submitted }))
    .sort((a, b) => new Date(a.due) - new Date(b.due));
};
App.upcoming = (days = 7) => {
  const now = Date.now(), lim = now + days * 864e5;
  return App.deadlines().filter(d => !d.isDone && new Date(d.due) >= now - 864e5 * 3 && new Date(d.due) <= lim);
};

/* ---------- sync ---------- */
App.syncCanvas = async (quiet = false) => {
  if (!C.feed && !C.token) return;
  try {
    if (C.feed){
      let ics;
      try { ics = await App.api(`/api/ics?url=${encodeURIComponent(C.feed)}`); }
      catch (e) { if (!App.S.hasServer) { const r = await fetch(C.feed); ics = await r.text(); } else throw e; }
      if (typeof ics !== "string" || !ics.includes("BEGIN:VCALENDAR")) throw new Error("That link didn't return a calendar. Copy the Calendar Feed link again from Canvas.");
      C.items = App.parseICS(ics);
    }
    if (C.token) await syncGrades();
    C.last = Date.now(); save();
    makeAlerts();
    if (!quiet) App.toast("Canvas updated");
  } catch (e) {
    if (!quiet) App.toast(e.message || "Couldn't reach Canvas");
    console.warn(e);
  }
};

async function canvasGet(path){
  return App.api(`/api/canvas?path=${encodeURIComponent(path)}`, { headers: { "x-canvas-token": C.token } });
}
async function syncGrades(){
  const courses = await canvasGet("/api/v1/courses?enrollment_state=active&include[]=total_scores&per_page=50");
  C.courses = courses.map(c => ({ id: c.id, name: c.name, code: c.course_code, score: c.enrollments?.[0]?.computed_current_score ?? null, grade: c.enrollments?.[0]?.computed_current_grade ?? null }));
  const prev = new Map((C.grades || []).map(g => [g.id, g]));
  const all = [];
  for (const c of C.courses.slice(0, 12)){
    try {
      const subs = await canvasGet(`/api/v1/courses/${c.id}/students/submissions?student_ids[]=self&include[]=assignment&per_page=100`);
      subs.forEach(s => {
        const a = s.assignment || {};
        all.push({ id: s.id, course: c.name, courseShort: shortCourse(c.code || c.name), title: a.name, due: a.due_at, points: a.points_possible, score: s.score, grade: s.grade,
          gradedAt: s.graded_at, posted: s.posted_at || s.graded_at, late: s.late, missing: s.missing, submitted: !!s.submitted_at, url: a.html_url, isNew: !prev.has(s.id) || (s.graded_at && prev.get(s.id).gradedAt !== s.graded_at) });
      });
    } catch {}
  }
  // Mark Canvas feed items as submitted when Canvas says so.
  const subByUrl = new Map(all.filter(g => g.url).map(g => [g.url.replace(/\/$/, ""), g]));
  C.items.forEach(i => { const g = subByUrl.get((i.url || "").replace(/\/$/, "")); if (g){ i.submitted = g.submitted; i.missing = g.missing; } });
  C.grades = all;
}

/* ---------- alerts (in-app inbox + system notifications) ---------- */
function makeAlerts(){
  const now = Date.now();
  App.deadlines().forEach(d => {
    if (d.isDone) return;
    const t = new Date(d.due).getTime(), left = t - now;
    if (left > 0 && left < 864e5 && App.inbox.add({ id: "24h-" + d.uid, kind: "due", title: `Due ${App.relTime(d.due)}: ${d.title}`, body: d.courseShort || d.course || "Canvas", url: d.url }))
      App.notify("Due soon: " + d.title, `${d.courseShort || ""} · ${App.relTime(d.due)}`, "24h-" + d.uid);
    if (left <= 0 && left > -3 * 864e5 && (d.missing || !C.token) && App.inbox.add({ id: "late-" + d.uid, kind: "late", title: `${d.missing ? "Missing" : "Past due"}: ${d.title}`, body: `${d.courseShort || ""} · was due ${App.relTime(d.due)}${C.token ? "" : ". If you already submitted, mark it done."}`, url: d.url }))
      App.notify((d.missing ? "Missing: " : "Past due: ") + d.title, d.courseShort || "", "late-" + d.uid);
  });
  (C.grades || []).filter(g => g.isNew && g.score != null && g.posted && now - new Date(g.posted) < 14 * 864e5).forEach(g => {
    if (App.inbox.add({ id: "grade-" + g.id + "-" + g.gradedAt, kind: "grade", title: `Grade posted: ${g.title}`, body: `${g.courseShort} · ${g.score}${g.points ? " / " + g.points : ""}`, url: g.url }))
      App.notify("Grade posted: " + g.title, `${g.courseShort} · ${g.score}${g.points ? "/" + g.points : ""}`, "grade-" + g.id);
  });
}
App.makeAlerts = makeAlerts;

/* ---------- push alerts (server checks your feed even when the app is closed) ---------- */
const b64ToU8 = b => { const p = "=".repeat((4 - b.length % 4) % 4), s = atob((b + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...s].map(c => c.charCodeAt(0))); };
App.enablePush = async () => {
  if (!("Notification" in window)) { App.toast("This browser can't show notifications. On iPhone, add Blue Jay Buddy to your Home Screen first."); return false; }
  const perm = await Notification.requestPermission();
  if (perm !== "granted") { App.toast("Notifications are blocked. Allow them in your browser settings."); return false; }
  store.set("bjb-notify", true);
  if (!App.S.hasServer || !C.feed || !("PushManager" in window)) { App.toast("Alerts on. You'll get them when the app is open."); return true; }
  try {
    const reg = await navigator.serviceWorker.ready;
    const { key } = await App.api("/api/push/key");
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(key) });
    await App.api("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subscription: sub, feed: C.feed, tz: Intl.DateTimeFormat().resolvedOptions().timeZone }) });
    store.set("bjb-push", true);
    App.toast("Push alerts on, even when the app is closed");
    return true;
  } catch (e) { console.warn(e); App.toast("Alerts on while the app is open. Push couldn't start: " + e.message); return true; }
};
App.disablePush = async () => {
  store.set("bjb-notify", false); store.set("bjb-push", false);
  try {
    const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription();
    if (sub){ await App.api("/api/push/unsubscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => {}); await sub.unsubscribe(); }
  } catch {}
  App.toast("Alerts off");
};

/* ---------- connect sheets ---------- */
App.canvasSheet = () => App.openSheet(`${App.sheetHead("Connect Canvas", "Deadlines in 1 minute. No password needed.")}
  <h3 class="h3">1. Copy your Canvas calendar link</h3>
  <ol class="mini-steps">
    <li>Open <a href="https://canvas.jhu.edu/calendar" target="_blank" rel="noopener">canvas.jhu.edu/calendar</a> on a computer (or your phone's browser).</li>
    <li>At the bottom right, click <b>Calendar Feed</b>.</li>
    <li>Copy the link. It looks like <code>https://canvas.jhu.edu/feeds/calendars/user_….ics</code></li>
  </ol>
  <label class="field">Paste it here<input id="cvFeed" type="url" inputmode="url" placeholder="https://canvas.jhu.edu/feeds/calendars/user_….ics" value="${esc(C.feed)}"></label>
  <p class="note">This link only shows your calendar. Anyone with it can see your due dates, so don't share it.</p>
  <details class="paste"><summary><b>2. Optional: see grades and late work</b></summary>
    <ol class="mini-steps">
      <li>In Canvas, open <b>Account → Settings</b>.</li>
      <li>Under Approved Integrations, click <b>+ New Access Token</b>. Purpose: Blue Jay Buddy. Pick an expiry date.</li>
      <li>Copy the token and paste it below. It stays on this device and is only passed through to Canvas when you refresh.</li>
    </ol>
    <label class="field">Canvas access token<input id="cvToken" type="password" autocomplete="off" value="${esc(C.token)}" placeholder="Paste token"></label>
    <p class="note">If JHU has turned tokens off, the button won't appear. Deadlines still work without it.</p>
  </details>
  <p class="note"><b>Gradescope:</b> it has no public connection. Deadlines appear here when your course links Gradescope to Canvas. Otherwise, add them with "Add a deadline".</p>
  <div class="row"><button class="btn primary" type="button" id="cvSave">${svg("link")}Connect</button>${C.feed || C.token ? `<button class="btn ghost danger" type="button" id="cvRemove">Disconnect</button>` : ""}</div>
  <p class="status" id="cvStatus" role="status"></p>`, "tall");

App.addDeadlineSheet = () => App.openSheet(`${App.sheetHead("Add a deadline", "For Gradescope, exams, or anything not on Canvas.")}
  <form id="dlForm" class="form">
    <label class="field">What's due<input name="title" required maxlength="80" placeholder="e.g. Homework 4 (Gradescope)"></label>
    <label class="field">Course<select name="course"><option value="">—</option>${App.S.classes.filter(c => !c.ex).map(c => `<option>${esc(c.code ? c.code.slice(3) + " " : "")}${esc(c.name)}</option>`).join("")}</select></label>
    <div class="row2"><label class="field">Date<input name="date" type="date" required></label><label class="field">Time<input name="time" type="time" value="23:59" required></label></div>
    <label class="field">Link <span class="note">optional</span><input name="url" type="url" placeholder="https://www.gradescope.com/…"></label>
    <div class="row"><button class="btn primary" type="submit">${svg("plus")}Add</button></div>
  </form>`);

document.addEventListener("submit", e => {
  if (e.target.id !== "dlForm") return;
  e.preventDefault();
  const f = new FormData(e.target);
  const due = new Date(`${f.get("date")}T${f.get("time")}`);
  C.manual = C.manual || [];
  C.manual.push({ uid: "m-" + Date.now(), title: f.get("title"), course: f.get("course"), courseShort: f.get("course"), due: due.toISOString(), url: App.safeUrl(f.get("url")), kind: "assignment", src: "manual" });
  save(); App.closeSheet(); App.toast("Deadline added"); App.render();
});
document.addEventListener("click", async e => {
  const t = e.target;
  if (t.closest("[data-canvas]")) { e.preventDefault(); App.canvasSheet(); }
  if (t.closest("[data-add-deadline]")) { e.preventDefault(); App.addDeadlineSheet(); }
  if (t.closest("[data-sync]")) { e.preventDefault(); t.closest("[data-sync]").classList.add("spin"); await App.syncCanvas(); App.render(); }
  const done = t.closest("[data-done]");
  if (done){ const id = done.dataset.done; C.done = C.done || []; C.done.includes(id) ? C.done.splice(C.done.indexOf(id), 1) : C.done.push(id); save(); App.render(); }
  const del = t.closest("[data-del-deadline]");
  if (del){ C.manual = (C.manual || []).filter(m => m.uid !== del.dataset.delDeadline); save(); App.render(); }
  if (t.id === "cvRemove"){ Object.assign(C, { feed: "", token: "", items: [], grades: [], courses: [] }); save(); App.disablePush(); App.closeSheet(); App.render(); }
  if (t.id === "cvSave"){
    const feed = App.$("#cvFeed").value.trim(), token = App.$("#cvToken").value.trim(), st = App.$("#cvStatus");
    if (feed && !/^https:\/\/[\w.-]+\/feeds\/calendars\/[\w-]+\.ics/.test(feed)) { st.textContent = "That doesn't look like a Canvas Calendar Feed link. It should end in .ics"; return; }
    C.feed = feed; C.token = token; save();
    st.textContent = "Connecting…";
    await App.syncCanvas(true);
    if (C.feed && !C.items.length) { st.textContent = "Connected, but no events came back yet. Try Refresh in a minute."; }
    App.closeSheet(); App.toast(`Canvas connected: ${App.deadlines().length} deadlines`); App.go("classes/due");
    App.S.setupStep("canvas");
  }
});
})();

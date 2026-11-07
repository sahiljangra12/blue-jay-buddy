// Setup: a short "About you" form, the setup checklist on Today, new-student to-dos and Settings.
(() => {
"use strict";
const App = window.App, { esc, svg, store } = App;

const CHECK = {
  jhed:{label:"Set up your JHED login and MFA", g:"jhed"}, wifi:{label:"Connect to eduroam Wi-Fi", g:"wifi"},
  jcard:{label:"Get your J-Card and add it to your phone", g:"jcard"}, canvas:{label:"Install the Canvas app", g:"canvas"},
  ois:{label:"Finish OIS check-in (international)", g:"ois"}, transloc:{label:"Install TransLoc for shuttles", g:"transloc"},
  livesafe:{label:"Install LiveSafe", g:"livesafe"}, emergency:{label:"Save the campus emergency number", g:"emergency"},
  insurance:{label:"Enroll in or waive student health insurance", g:"insurance"}, calendar:{label:"Save this semester's key dates", g:"calendar"},
  sis:{label:"Check SIS for holds and your registration date", g:"sis"}, handshake:{label:"Set up your Handshake profile", g:"handshake"},
  printing:{label:"Set up mobile printing", g:"printing"}, groups:{label:"Join one club in Hopkins Groups", g:"groups"},
};
const doneSet = new Set(store.get("bjb-done", []));

App.S.checklist = () => {
  const p = App.S.profile; if (!p) return [];
  const isNew = p.status === "new", ids = [];
  if (isNew) ids.push("jhed","wifi","jcard","canvas","insurance");
  if (p.intl) ids.push("ois");
  ids.push("calendar");
  if (isNew || p.live !== "oncampus") ids.push("transloc");
  ids.push("emergency");
  if (isNew) ids.push("livesafe","printing","groups");
  if (!isNew) ids.push("sis","handshake");
  return [...new Set(ids)].map(id => Object.assign({ id, done: doneSet.has(id) }, CHECK[id]));
};

// Setup steps shown on Today until done. Each one unlocks a feature.
App.S.setupList = () => {
  const d = new Set(store.get("bjb-setup", []));
  const real = App.S.classes.some(c => !c.ex);
  return [
    { id:"about", label:"About you", why:"Your program, where you live, what you eat.", cta:"Start", attr:"data-wizard", done: !!App.S.profile, primary: true },
    { id:"schedule", label:"Your classes", why:"Upload your SIS schedule: PDF or screenshot.", cta:"Upload", attr:"data-import", done: real },
    { id:"canvas", label:"Canvas deadlines", why:"See everything due, late and graded.", cta:"Connect", attr:"data-canvas", done: !!App.canvas.feed },
    { id:"program", label:"Degree tracker", why:"Core courses, electives, what's left.", cta:"Pick program", attr:'data-href="#classes/program"', done: !!App.S.profile?.program || d.has("program") },
    { id:"budget", label:"Food budget", why:"A weekly meal plan that fits it.", cta:"Set budget", attr:"data-budget-settings", done: d.has("budget") },
    { id:"alerts", label:"Alerts", why:"Due tomorrow, late work, new grades.", cta:"Turn on", attr:"data-enable-push", done: store.get("bjb-notify", false) },
  ];
};
App.S.setupStep = id => { const d = new Set(store.get("bjb-setup", [])); d.add(id); store.set("bjb-setup", [...d]); };

/* ---------- About you ---------- */
App.wizard = () => {
  const p = Object.assign({ status: "new", level: "", school: "", intl: false, live: "", diet: App.budget.diet, program: "" }, App.S.profile || {});
  const chip = (name, v, l, type = "radio", on = false) => `<label class="chip"><input type="${type}" name="${name}" value="${v}" ${on ? "checked" : ""}><span>${l}</span></label>`;
  App.openSheet(`${App.sheetHead("About you", "Six quick answers. Stays on this device.")}
  <form class="form" id="wizForm">
    <label class="field">First name <span class="note">optional</span><input name="name" maxlength="30" value="${esc(p.name || "")}" autocomplete="given-name"></label>
    <fieldset><legend>Are you new to Hopkins?</legend><div class="opts">${chip("status","new","New this year","radio",p.status === "new")}${chip("status","returning","Been here before","radio",p.status === "returning")}</div></fieldset>
    <fieldset><legend>Level</legend><div class="opts">${[["undergrad","Undergraduate"],["masters","Master's"],["phd","PhD"]].map(([v, l]) => chip("level", v, l, "radio", p.level === v)).join("")}</div></fieldset>
    <label class="field">Program <span class="note">for your degree tracker</span><select name="program"><option value="">Not listed / later</option>${window.BJB_PROGRAMS.list.map(x => `<option value="${x.id}" ${p.program === x.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label>
    <fieldset><legend>International student (F-1 / J-1)?</legend><div class="opts">${chip("intl","yes","Yes","radio",p.intl === true)}${chip("intl","no","No","radio",p.intl === false)}</div></fieldset>
    <fieldset><legend>Where do you live?</legend><div class="opts">${[["oncampus","On campus"],["nearby","Near Homewood"],["commute","I commute"]].map(([v, l]) => chip("live", v, l, "radio", p.live === v)).join("")}</div></fieldset>
    <fieldset><legend>What do you eat?</legend><div class="opts">${[["veg","Vegetarian"],["egg","Veg + eggs"],["vegan","Vegan"],["nonveg","Non-veg"]].map(([v, l]) => chip("diet", v, l, "radio", App.budget.diet === v)).join("")}</div></fieldset>
    <div class="row"><button class="btn primary" type="submit">${svg("check")}Save</button></div>
  </form>`, "tall");
};

App.settingsSheet = () => {
  const notify = store.get("bjb-notify", false);
  App.openSheet(`${App.sheetHead("You & settings")}
  <div class="set-list">
    <button class="set" type="button" data-wizard><b>About you</b><span>${App.S.profile ? esc([App.S.profile.name, App.S.profile.level, App.S.profile.live].filter(Boolean).join(" · ")) : "Not set"}</span></button>
    <button class="set" type="button" data-import><b>Upload schedule</b><span>${App.S.classes.filter(c => !c.ex).length} classes saved</span></button>
    <button class="set" type="button" data-canvas><b>Canvas</b><span>${App.canvas.feed ? "Connected" + (App.canvas.token ? " with grades" : "") : "Not connected"}</span></button>
    <button class="set" type="button" data-budget-settings><b>Food budget & diet</b><span>${App.money(App.budget.weekly)}/week · ${esc(App.budget.diet)}</span></button>
    <button class="set" type="button" ${notify ? "data-disable-push" : "data-enable-push"}><b>Alerts</b><span>${notify ? "On · tap to turn off" : "Off · tap to turn on"}</span></button>
    <button class="set" type="button" id="themeSet"><b>Appearance</b><span>${{ light: "Light", dark: "Dark" }[store.get("bjb-theme", "")] || "Match my device"}</span></button>
    <a class="set" href="#" data-sheet="privacy"><b>Privacy</b><span>What's stored and where</span></a>
    <button class="set danger" type="button" id="resetAll"><b>Erase everything on this device</b><span>Classes, budget, Canvas link, chat</span></button>
  </div>
  <p class="note">Install it like an app: iPhone Share → Add to Home Screen. Android menu ⋮ → Install app.</p>`, "tall");
};

function applyTheme(){ const t = store.get("bjb-theme", ""); t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }
applyTheme();

document.addEventListener("submit", e => {
  if (e.target.id !== "wizForm") return;
  e.preventDefault();
  const f = new FormData(e.target);
  App.S.profile = Object.assign(App.S.profile || {}, { name: f.get("name").trim(), status: f.get("status") || "new", level: f.get("level") || "", program: f.get("program") || "", intl: f.get("intl") === "yes", live: f.get("live") || "" });
  if (f.get("diet")) { App.budget.diet = f.get("diet"); store.set("bjb-budget", App.budget); }
  App.saveProfile(); App.markTakingFromClasses(); App.closeSheet(); App.toast("Saved"); App.render();
});
document.addEventListener("click", e => {
  const t = e.target;
  if (t.closest("[data-wizard]")) { e.preventDefault(); App.wizard(); }
  const hr = t.closest("[data-href]"); if (hr) { App.closeSheet(); location.hash = hr.dataset.href; }
  const tk = t.closest("[data-tick]"); if (tk){ const id = tk.dataset.tick; doneSet.has(id) ? doneSet.delete(id) : doneSet.add(id); store.set("bjb-done", [...doneSet]); App.render(); }
  if (t.closest("#settingsBtn")) App.settingsSheet();
  if (t.closest("#inboxBtn")) App.openInbox();
  if (t.closest("[data-disable-push]")) { App.disablePush(); App.closeSheet(); }
  if (t.closest("#themeSet")){ const cur = store.get("bjb-theme", ""), next = cur === "" ? "dark" : cur === "dark" ? "light" : ""; store.set("bjb-theme", next); applyTheme(); App.settingsSheet(); }
  if (t.closest("#resetAll") && confirm("Erase all Blue Jay Buddy data on this device?")){ Object.keys(localStorage).filter(k => k.startsWith("bjb-")).forEach(k => localStorage.removeItem(k)); App.disablePush(); location.reload(); }
});
})();

// Core: helpers, storage, icons, sheets, toasts, router and the alert inbox.
// Every other file adds its views to window.App.
(() => {
"use strict";
const D = window.BJB, G = window.BJB_GUIDES || {};
const App = window.App = { D, G, views: {}, subs: {} };

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const DAY = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = hm => { if (!hm) return ""; const [h,m] = hm.split(":").map(Number); return ((h+11)%12+1) + ":" + String(m).padStart(2,"0") + (h>=12?" PM":" AM"); };
const mins = hm => { const [h,m] = String(hm||"0:0").split(":").map(Number); return h*60+m; };
const money = n => "$" + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0);
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const safeUrl = u => /^https?:\/\//i.test(u || "") ? u : (u ? "https://" + u : "");
const telOf = p => "tel:" + p.replace(/\D/g, "");
const monthLabel = ym => { const [y, m] = String(ym || "").split("-").map(Number); return y && m ? `${MON[m-1]} ${y}` : ""; };
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
function relTime(date){
  const d = new Date(date), now = new Date(), ms = d - now, abs = Math.abs(ms);
  const h = Math.round(abs / 36e5), dd = Math.round(abs / 864e5);
  const time = d.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});
  const sameDay = d.toDateString() === now.toDateString();
  const tmr = new Date(now); tmr.setDate(now.getDate() + 1);
  if (ms < 0){ if (abs < 36e5) return `${Math.max(1, Math.round(abs/6e4))} min ago`; if (abs < 864e5) return `${h} h ago`; return `${dd} day${dd>1?"s":""} ago`; }
  if (abs < 36e5) return `in ${Math.max(1, Math.round(abs/6e4))} min`;
  if (sameDay) return `today ${time}`;
  if (d.toDateString() === tmr.toDateString()) return `tomorrow ${time}`;
  if (dd < 7) return `${DAY[d.getDay()]} ${time}`;
  return `${MON[d.getMonth()]} ${d.getDate()}, ${time}`;
}
Object.assign(App, { $, $$, esc, DAY, MON, fmt, mins, money, reduced, safeUrl, telOf, monthLabel, dayKey, relTime });

/* ---------- storage (this device only) ---------- */
App.store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k){ try { localStorage.removeItem(k); } catch {} },
};

/* ---------- server (Netlify functions). Same origin on Netlify, cross-origin from GitHub Pages ---------- */
App.apiBase = ""; // the server lives on the same site (Netlify); the GitHub Pages copy forwards there once it is up (main.js)
App.api = async (path, opts = {}) => {
  const r = await fetch(App.apiBase + path, opts);
  const type = r.headers.get("content-type") || "";
  const body = type.includes("json") ? await r.json() : await r.text();
  if (!r.ok) { const e = new Error((body && body.error) || ("Server error " + r.status)); e.status = r.status; throw e; }
  return body;
};

/* ---------- icons ---------- */
const ICON = {
  today:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  classes:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  food:'<path d="M4 3v8a3 3 0 0 0 6 0V3M7 3v18M17 3c-2 0-3 3-3 6s1 4 3 4v8"/>',
  campus:'<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>',
  ask:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
  mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2z"/>',
  walk:'<circle cx="13" cy="4" r="2"/><path d="M9 21l2-6 3 3v5M7 12l3-4 4 1 3 3M10 8l-1 6"/>',
  open:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
  star:'<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
  dumbbell:'<path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"/>',
  bus:'<rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 11h16M8 21l1-4M16 21l-1-4"/>',
  wallet:'<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16" cy="14" r="1.5"/>',
  pin:'<path d="M12 22s7-7.4 7-13a7 7 0 0 0-14 0c0 5.6 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/>',
  users:'<circle cx="9" cy="8" r="4"/><path d="M1 21c1-4 4-6 8-6s7 2 8 6M17 4a4 4 0 0 1 0 8M23 21c-.5-2.6-2-4.4-4-5.3"/>',
  tag:'<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  cart:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
  shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  heart:'<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>',
  briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
  guide:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  video:'<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3z"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  sound:'<path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  refresh:'<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.8-3.4L23 10M1 14l4.7 4.4A9 9 0 0 0 20.5 15"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
  grad:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  flag:'<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
};
App.svg = (name, attrs = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${ICON[name] || ICON.open}</svg>`;
const svg = App.svg;

/* ---------- small UI builders ---------- */
App.ext = (u, label, cls = "btn") => u ? `<a class="${cls}" href="${esc(u)}" target="_blank" rel="noopener">${label}</a>` : "";
App.maps = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
App.walkTo = q => "https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=" + encodeURIComponent(q);
App.head = (title, sub = "", right = "") => `<div class="sec-head"><div><h2>${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ""}</div>${right}</div>`;
App.empty = (title, body, action = "") => `<div class="empty"><b>${title}</b><p>${body}</p>${action}</div>`;
App.callBtn = (label, num, cls = "btn") => `<a class="${cls}" href="${telOf(num)}" data-call="${esc(num)}" data-label="${esc(label)}">${svg("phone")}${esc(num)}</a>`;

// A link card with a one-line "use this when" context, Open, How-to and Call.
App.itemCard = (it, words = []) => {
  const hl = t => { let out = esc(t); words.forEach(w => { if (w.length > 1) out = out.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`,"ig"), "<mark>$1</mark>"); }); return out; };
  return `<article class="item">
    <div class="item-main">
      <h3>${hl(it.t)}</h3>
      <p>${hl(it.d)}</p>
      ${it.when ? `<p class="when">${svg("clock")}Use when: ${esc(it.when)}</p>` : ""}
    </div>
    <div class="item-acts">
      ${it.u ? `<a class="btn sm" href="${esc(it.u)}" target="_blank" rel="noopener">Open ${svg("open")}</a>` : ""}
      ${it.g && G[it.g] ? `<button class="btn sm soft" type="button" data-guide="${it.g}">How to</button>` : ""}
      ${it.p ? App.callBtn(it.t, it.p, "btn sm soft") : ""}
    </div>
  </article>`;
};

/* ---------- toast ---------- */
let toastT;
App.toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600); };

/* ---------- bottom sheet / dialog ---------- */
let lastFocus = null;
App.openSheet = (html, cls = "") => {
  lastFocus = document.activeElement;
  $("#sheet").className = "sheet " + cls;
  $("#sheetBody").innerHTML = html;
  $("#sheetWrap").hidden = false;
  document.body.classList.add("locked");
  requestAnimationFrame(() => { $("#sheetWrap").classList.add("open"); ($("#sheetBody [autofocus]") || $("#sheetBody h2") || $("#sheet")).focus?.(); });
};
App.closeSheet = () => {
  $("#sheetWrap").classList.remove("open");
  document.body.classList.remove("locked");
  setTimeout(() => { $("#sheetWrap").hidden = true; $("#sheetBody").innerHTML = ""; }, 180);
  lastFocus?.focus?.();
};
App.sheetHead = (title, sub = "") => `<div class="sheet-head"><div><h2 id="sheetTitle" tabindex="-1">${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ""}</div><button class="icon-btn" type="button" data-close aria-label="Close">${svg("close")}</button></div>`;
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#sheetWrap").hidden) App.closeSheet(); });

/* Calls always ask first so nobody dials by accident. */
App.callSheet = (label, num) => App.openSheet(`${App.sheetHead("Call " + esc(label) + "?")}
  <p class="big-num">${esc(num)}</p>
  <div class="row"><a class="btn primary" href="${telOf(num)}" data-really>${svg("phone")}Call now</a>
  <button class="btn soft" type="button" data-copy="${esc(num)}">Copy number</button>
  <button class="btn ghost" type="button" data-close>Cancel</button></div>`);

App.guideSheet = id => {
  const g = G[id]; if (!g) return;
  App.openSheet(`${App.sheetHead(esc(g.title), `${esc(g.who)} · ${esc(g.time)}`)}
    ${g.apps ? `<div class="apps">${g.apps.map(a => `<div class="app-row"><b>${esc(a.name)}</b>${a.ios ? `<a class="btn sm soft" href="${esc(a.ios)}" target="_blank" rel="noopener">App Store</a>` : ""}${a.android ? `<a class="btn sm soft" href="${esc(a.android)}" target="_blank" rel="noopener">Google Play</a>` : ""}</div>`).join("")}</div>` : ""}
    <ol class="steps">${g.steps.map(s => `<li>${s}</li>`).join("")}</ol>
    ${g.tips ? `<div class="tips">${g.tips.map(t => `<p>${t}</p>`).join("")}</div>` : ""}
    ${g.phones ? `<div class="row">${g.phones.map(p => App.callBtn(p.t, p.p, "btn soft")).join("")}</div>` : ""}
    ${g.link ? `<div class="row"><a class="btn primary" href="${esc(g.link.u)}" target="_blank" rel="noopener">${esc(g.link.t)} ${svg("open")}</a></div>` : ""}`, "tall");
};

App.copy = async text => { try { await navigator.clipboard.writeText(text); App.toast("Copied"); } catch { App.toast(text); } };

/* ---------- alert inbox (deadlines, grades) ---------- */
App.inbox = {
  list(){ return App.store.get("bjb-inbox", []); },
  add(a){
    const all = this.list();
    if (all.some(x => x.id === a.id)) return false;
    all.unshift(Object.assign({ at: Date.now(), read: false }, a));
    App.store.set("bjb-inbox", all.slice(0, 60));
    this.badge();
    return true;
  },
  readAll(){ App.store.set("bjb-inbox", this.list().map(x => Object.assign(x, {read:true}))); this.badge(); },
  badge(){ $("#inboxDot").hidden = !this.list().some(x => !x.read); },
};
App.notify = async (title, body, tag) => {
  // System notification when allowed; always lands in the inbox too.
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) reg.showNotification(title, { body, tag, icon: "assets/icon-192.png", badge: "assets/icon-192.png" });
    else new Notification(title, { body, tag });
  } catch {}
};
App.openInbox = () => {
  const all = App.inbox.list();
  App.openSheet(`${App.sheetHead("Alerts", "Deadlines, late work and new grades.")}
    ${all.length ? `<ul class="inbox">${all.map(a => `<li class="${a.read ? "" : "unread"} k-${a.kind}">
      <span class="ib-ic">${svg(a.kind === "grade" ? "star" : a.kind === "late" ? "alert" : "clock")}</span>
      <div><b>${esc(a.title)}</b><p>${esc(a.body)}</p><span class="note">${new Date(a.at).toLocaleString([], {month:"short", day:"numeric", hour:"numeric", minute:"2-digit"})}</span></div>
      ${a.url ? `<a class="btn sm soft" href="${esc(a.url)}" target="_blank" rel="noopener">Open</a>` : ""}</li>`).join("")}</ul>`
      : App.empty("No alerts yet", "Connect Canvas in Classes → Due and alerts for upcoming, late and graded work will show here.", `<a class="btn primary" href="#classes/due" data-close>Connect Canvas</a>`)}`, "tall");
  App.inbox.readAll();
};

/* ---------- router: #tab/sub ---------- */
App.TABS = [
  ["today", "Today", "today"],
  ["classes", "Classes", "classes"],
  ["food", "Food & Money", "food"],
  ["campus", "Campus", "campus"],
  ["ask", "Ask", "ask"],
];
App.route = () => {
  const [tab, sub, ...rest] = location.hash.replace(/^#\/?/, "").split("/");
  return { tab: App.TABS.some(t => t[0] === tab) ? tab : "today", sub: sub || "", arg: rest.join("/") };
};
App.go = hash => { if (location.hash === "#" + hash) App.render(); else location.hash = hash; };

// Sub-tab bar used by Classes, Food & Money and Campus.
App.subnav = (tab, items, cur) => `<nav class="subnav" aria-label="${esc(tab)} sections">${items.map(([id, label]) =>
  `<a href="#${tab}/${id}" class="${id === cur ? "on" : ""}" ${id === cur ? 'aria-current="page"' : ""}>${esc(label)}</a>`).join("")}</nav>`;

App.render = () => {
  const r = App.route(), q = $("#q").value.trim();
  $("#tabs").innerHTML = App.TABS.map(([id, label, ic]) => `<a href="#${id}" class="tab ${!q && id === r.tab ? "on" : ""}" ${!q && id === r.tab ? 'aria-current="page"' : ""}>${svg(ic)}<span>${label}</span></a>`).join("");
  const main = $("#main");
  try {
    main.innerHTML = q ? App.views.search(q) : App.views[r.tab](r.sub, r.arg);
  } catch (err) {
    console.error(err);
    main.innerHTML = App.empty("Something did not load.", "Reload the page. If it keeps happening, send feedback.", `<button class="btn primary" type="button" onclick="location.reload()">Reload</button>`);
  }
  App.afterRender.forEach(fn => { try { fn(r); } catch (e) { console.error(e); } });
  window.BJB_ART?.watch?.(main);
};
App.afterRender = [];

/* ---------- search across everything ---------- */
App.views.search = q => {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hit = s => words.every(w => s.toLowerCase().includes(w));
  const items = D.items.filter(it => hit(`${it.t} ${it.d} ${it.k || ""} ${it.cat}`));
  const guides = Object.entries(G).filter(([, g]) => hit(`${g.title} ${g.who} ${(g.steps || []).join(" ")}`));
  const F = window.BJB_FOOD;
  const food = F.places.filter(p => hit(`${p.n} ${p.cui} ${p.pick} ${p.vegPick} ${p.area} food eat`));
  const deals = F.deals.filter(d => hit(`${d.n} ${d.what} ${d.cat} deal discount student`));
  const blds = D.buildings.filter(([n, t]) => hit(`${n} ${t}`));
  const total = items.length + guides.length + food.length + deals.length + blds.length;
  return `<section class="page">
    ${App.head(`Results for “${esc(q)}”`, `${total} found. <button class="linkbtn" type="button" data-clear-search>Clear search</button>`)}
    ${total ? "" : App.empty("Nothing matched", "Try fewer words, or ask in plain English.", `<a class="btn primary" href="#ask" data-ask-q="${esc(q)}">${svg("mic")}Ask “${esc(q)}”</a>`)}
    ${guides.length ? `<h3 class="grp">Step-by-step guides</h3><div class="list">${guides.map(([id, g]) => `<button class="item tap" type="button" data-guide="${id}"><div class="item-main"><h3>${esc(g.title)}</h3><p>${esc(g.who)} · ${esc(g.time)}</p></div></button>`).join("")}</div>` : ""}
    ${items.length ? `<h3 class="grp">Links and offices</h3><div class="list">${items.map(it => App.itemCard(it, words)).join("")}</div>` : ""}
    ${food.length ? `<h3 class="grp">Food</h3><div class="list">${food.map(App.placeCard).join("")}</div>` : ""}
    ${deals.length ? `<h3 class="grp">Deals</h3><div class="list">${deals.map(App.dealCard).join("")}</div>` : ""}
    ${blds.length ? `<h3 class="grp">Buildings</h3><div class="list">${blds.map(([n, t]) => `<a class="item tap" href="${App.walkTo(n + ", Johns Hopkins Homewood, Baltimore")}" target="_blank" rel="noopener"><div class="item-main"><h3>${esc(n)}</h3><p>${esc(t)} · Walking directions</p></div></a>`).join("")}</div>` : ""}
  </section>`;
};

/* ---------- global click handling ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("[data-close],[data-guide],[data-call],[data-copy],[data-sheet],[data-clear-search],[data-ask-q]");
  if (!t) return;
  if (t.matches("[data-call]") && !t.matches("[data-really]")) { e.preventDefault(); App.callSheet(t.dataset.label, t.dataset.call); return; }
  if (t.matches("[data-guide]")) { e.preventDefault(); App.guideSheet(t.dataset.guide); return; }
  if (t.matches("[data-copy]")) { App.copy(t.dataset.copy); return; }
  if (t.matches("[data-clear-search]")) { $("#q").value = ""; App.render(); return; }
  if (t.matches("[data-ask-q]")) { App.pendingAsk = t.dataset.askQ; $("#q").value = ""; }
  if (t.matches("[data-sheet='privacy']")) { e.preventDefault(); App.privacySheet(); return; }
  if (t.matches("[data-close]")) { if (!t.getAttribute("href")) e.preventDefault(); App.closeSheet(); }
});

/* ---------- shared state (this device only) ---------- */
App.S = {
  profile: App.store.get("bjb-profile", null),
  classes: App.store.get("bjb-classes", null),
  hasServer: false, // set in main.js after the server answers
};
if (App.S.classes === null) App.S.classes = [
  { id: 1, code: "", name: "Example: Data Structures", mode: "inperson", days: [1,3], start: "10:30", end: "11:45", bldg: "Malone Hall", room: "228", ex: true },
  { id: 2, code: "", name: "Example: Applied Statistics", mode: "online", days: [2,4], start: "13:30", end: "14:45", link: "", ex: true },
];
App.S.classes.forEach(c => { c.mode ||= "inperson"; c.days ||= []; });
App.saveClasses = () => App.store.set("bjb-classes", App.S.classes);
App.saveProfile = () => App.store.set("bjb-profile", App.S.profile);

App.privacySheet = () => App.openSheet(`${App.sheetHead("Privacy")}
  <ul class="bul">
    <li>Your classes, budget, program progress and settings stay in this browser only.</li>
    <li>Schedule PDFs and screenshots are read on your device. They are never uploaded.</li>
    <li>Your Canvas calendar link and Canvas token are sent to the Blue Jay Buddy server only to fetch your Canvas data, then thrown away. The calendar link is stored on the server only if you turn on push alerts, and you can turn them off anytime.</li>
    <li>Questions sent to the assistant that it cannot answer on your device go to an AI model with a short summary of your day. Nothing is kept.</li>
    <li>Groups require a free sign-in with your @jh.edu email. Group names, members and posts are visible to other signed-in JHU students.</li>
    <li>Blue Jay Buddy never asks for your JHED password.</li>
  </ul>`);
})();

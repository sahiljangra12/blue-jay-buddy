(() => {
"use strict";
const D = window.BJB, G = window.BJB_GUIDES, MAPS = D.maps;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const strip = s => String(s).replace(/<[^>]+>/g, "");
const DAY = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const PH = Object.fromEntries(D.photos.map(p => [p.key, p]));
const onImg = `onload="this.classList.add('loaded')" onerror="this.remove()"`;

/* ================= storage (this device only) ================= */
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k){ try { localStorage.removeItem(k); } catch {} },
};

/* ================= icons ================= */
const ICON = {
  academics:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  services:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
  health:'<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/>',
  move:'<rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 11h16M8 21l1-4M16 21l-1-4"/>',
  food:'<path d="M4 3v8a3 3 0 0 0 6 0V3M7 3v18M17 3c-2 0-3 3-3 6s1 4 3 4v8"/>',
  fun:'<circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  safety:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  walk:'<circle cx="13" cy="4" r="2"/><path d="M9 21l2-6 3 3v5M7 12l3-4 4 1 3 3M10 8l-1 6"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>',
  star:'<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
  guide:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  open:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
  sparkle:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  apple:'<path d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.9-3-.8a4.5 4.5 0 0 0-3.8 2.3c-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3a10 10 0 0 0 1.3-2.6s-2.5-1-2.5-3.7zM14.2 5.5A3.3 3.3 0 0 0 15 3a3.4 3.4 0 0 0-2.2 1.1 3.2 3.2 0 0 0-.8 2.4 2.8 2.8 0 0 0 2.2-1z"/>',
  play:'<path d="M4 3.5v17a1 1 0 0 0 1.5.9L20 13a1.2 1.2 0 0 0 0-2L5.5 2.6A1 1 0 0 0 4 3.5z"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  video:'<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3z"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
};
const svg = (name, attrs = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${ICON[name]}</svg>`;
const initials = n => n.replace(/^(Ralph S\.|Milton S\.)\s*/,"").split(/\s+/).filter(w=>/^[A-Z]/.test(w)).slice(0,2).map(w=>w[0]).join("");
const telOf = p => "tel:" + p.replace(/\D/g, "");
const safeUrl = u => /^https?:\/\//i.test(u || "") ? u : (u ? "https://" + u : "");

/* ================= state ================= */
let profile = store.get("bjb-profile", null);
let favs = new Set(store.get("bjb-favs", []));
let doneSet = new Set(store.get("bjb-done", []));
let classes = store.get("bjb-classes", null);
if (classes === null) classes = [
  {id:1,name:"Data Structures",mode:"inperson",days:[1,3],start:"10:30",end:"11:45",bldg:"Malone Hall",room:"228",ex:true},
  {id:2,name:"Applied Statistics",mode:"online",days:[2,4],start:"13:30",end:"14:45",link:"",ex:true},
];
classes.forEach(c => { if (!c.mode) c.mode = "inperson"; });
const realClasses = () => classes.filter(c => !c.ex);
const saveClasses = () => store.set("bjb-classes", classes);
const where = c => c.mode === "online" ? "Online" : `${c.bldg}${c.room ? ", room " + c.room : ""}${c.mode === "hybrid" ? " · hybrid" : ""}`;

const validTabs = ["home", "guides", ...D.sections.map(s => s.id)];
let tab = validTabs.includes(location.hash.slice(1)) ? location.hash.slice(1) : "home";

/* ================= theme, greeting, hero photo ================= */
function applyTheme(t){ t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }
applyTheme(store.get("bjb-theme", null));
$("#themeBtn").addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark" ||
    (!document.documentElement.hasAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  const next = dark ? "light" : "dark";
  applyTheme(next); store.set("bjb-theme", next); toast(next === "dark" ? "Dark mode" : "Light mode");
});
function setSky(){
  const h = new Date().getHours();
  document.body.dataset.sky = h >= 5 && h < 8 ? "dawn" : h >= 8 && h < 17 ? "day" : h >= 17 && h < 20 ? "dusk" : "night";
  const g = h < 5 ? "Up late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good night";
  $("#greet").textContent = `${g}${profile?.name ? ", " + profile.name : ""} · ${new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}`;
}
function heroCta(){
  $("#planBtn").innerHTML = profile ? `${svg("edit")}Edit my plan` : `${svg("sparkle")}Make it mine <span class="tag">1 min</span>`;
  $("#navPlanBtn").textContent = profile ? "My plan" : "Make it mine";
}
(function heroPhoto(){
  const p = PH.hero, img = $("#heroPhoto"), w = Math.min(2400, Math.round(innerWidth * (devicePixelRatio || 1) / 400) * 400 || 1600);
  img.onload = () => { img.classList.add("loaded"); $("#heroCredit").innerHTML = `Photo: <a href="${p.page}" target="_blank" rel="noopener">${esc(p.title)}, ${esc(p.credit)}</a>`; };
  img.onerror = () => img.remove();
  img.src = p.src(Math.max(1200, w));
})();
$("#credits").innerHTML = D.photos.map(p => `<li><a href="${p.page}" target="_blank" rel="noopener">${esc(p.title)}</a> · ${esc(p.credit)}</li>`).join("") +
  `<li>Illustrations and the Blue Jay Buddy mark are original artwork for this project.</li>`;

/* ================= quick actions ================= */
function renderQuick(){
  const Q = [
    {t:"Emergency", u:"tel:4105167777", i:"phone", cls:"sos"},
    {t:"Safety escort", u:"tel:4105164600", i:"walk"},
    {t:"Shuttles", guide:"transloc", i:"move"},
    {t:"Food hours", u:"https://studentaffairs.jhu.edu/dining/where-to-eat/", i:"food"},
    {t:"Canvas", u:"https://canvas.jhu.edu", i:"academics"},
    {t:"SIS", u:"https://sis.jhu.edu", i:"services"},
    {t:"Library", u:"https://www.library.jhu.edu", i:"book"},
    {t:"Clubs & events", u:"https://jhu.campusgroups.com", i:"fun"},
  ];
  $("#quick").innerHTML = Q.map(q => q.guide
    ? `<button type="button" class="qa" data-guide="${q.guide}"><span class="ic">${svg(q.i)}</span>${esc(q.t)}</button>`
    : `<a class="qa ${q.cls||""}" href="${q.u}" ${q.u.startsWith("http")?'target="_blank" rel="noopener"':""}><span class="ic">${svg(q.i)}</span>${esc(q.t)}</a>`).join("");
}

/* ================= helpers ================= */
const fmt = hm => { const [h,m] = hm.split(":").map(Number); return ((h+11)%12+1) + ":" + String(m).padStart(2,"0") + (h>=12?" PM":" AM"); };
const mins = hm => { const [h,m] = hm.split(":").map(Number); return h*60+m; };
const rx = w => new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`,"ig");
const highlight = (text, words) => { let out = esc(text); words.forEach(w => { if (w.length > 1) out = out.replace(rx(w), "<mark>$1</mark>"); }); return out; };
const itemByTitle = t => D.items.find(i => i.t === t);
const head = (eyebrow, title, intro = "", right = "") => `<div class="sec-head"><div>${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}<h2>${title}</h2>${intro ? `<p class="intro">${intro}</p>` : ""}</div>${right}</div>`;

function card(it, i = 0, words = []){
  const fav = favs.has(it.t);
  const phone = it.p ? `<span class="phone">${esc(it.p)}<a class="mini call" href="${telOf(it.p)}" data-label="${esc(it.t)}" data-num="${esc(it.p)}">${svg("phone")}Call</a><button class="mini" type="button" data-copy="${esc(it.p)}">Copy</button></span>` : "";
  return `<article class="card reveal" style="--i:${i}">
    <span class="badge b-${it.cat}">${svg(it.cat)}</span>
    <div class="card-body">
      <h3 class="t">${highlight(it.t, words)}</h3>
      <p class="d">${highlight(it.d, words)}</p>
      ${phone ? `<div class="meta">${phone}</div>` : ""}
      <div class="actions">
        <a class="act" href="${esc(it.u)}" target="_blank" rel="noopener">Open ${svg("open")}</a>
        ${it.g && G[it.g] ? `<button class="act soft" type="button" data-guide="${it.g}">How to</button>` : ""}
      </div>
    </div>
    <button class="star" type="button" data-fav="${esc(it.t)}" aria-pressed="${fav}" aria-label="${fav?"Remove from":"Add to"} favorites: ${esc(it.t)}">${svg("star")}</button>
  </article>`;
}
function bCard([n, type], i = 0, words = []){
  const p = PH[D.buildingPhoto[n]];
  return `<a class="card bcard reveal" style="--i:${i}" href="${MAPS(n)}" target="_blank" rel="noopener">
    <div class="bimg">${p ? `<img src="${p.src(640)}" alt="${esc(n)}" loading="lazy" ${onImg}>` : ""}<span class="mono">${esc(initials(n))}</span></div>
    <div class="card-body"><h3 class="t">${highlight(n, words)}</h3><div class="meta"><span class="chip">${esc(type)}</span><span class="note">Directions ›</span></div></div>
  </a>`;
}
function guideCard(id, i = 0, words = []){
  const g = G[id];
  return `<button class="card gcard reveal" style="--i:${i}" type="button" data-guide="${id}">
    <span class="badge b-guide">${svg("guide")}</span>
    <div class="card-body"><h3 class="t">${highlight(g.title, words)}</h3><p class="d">${esc(g.who)}</p>
    <div class="meta"><span class="chip">${esc(g.time)}</span>${g.apps ? `<span class="chip app">Has an app</span>` : ""}</div></div>
  </button>`;
}
function bento(){
  const keys = ["keyser","brody","mse","decker","gilman","shriver","museum","gate"];
  return `<section class="io" aria-labelledby="h-campus">${head("Your campus","Homewood, up close.","Tap a place for walking directions.")}
    <div class="bento">${keys.map(k => { const p = PH[k]; return `<figure class="ph">
      <img src="${p.src(k === "keyser" ? 1400 : 800)}" alt="${esc(p.title)}" loading="lazy" ${onImg}>
      <figcaption><b>${esc(p.title)}</b><span>${esc(p.caption)}</span></figcaption>
      <a href="${MAPS(p.title)}" target="_blank" rel="noopener" aria-label="Directions to ${esc(p.title)}"></a></figure>`; }).join("")}</div></section>`;
}

/* ================= personalization ================= */
const CHECK = {
  jhed:{label:"Set up your JHED login and MFA", g:"jhed"},
  wifi:{label:"Connect to eduroam Wi-Fi", g:"wifi"},
  jcard:{label:"Get your J-Card and add it to your phone", g:"jcard"},
  canvas:{label:"Install Canvas and find your courses", g:"canvas"},
  ois:{label:"Finish OIS check-in (international)", g:"ois"},
  transloc:{label:"Install TransLoc for shuttles", g:"transloc"},
  livesafe:{label:"Install LiveSafe", g:"livesafe"},
  emergency:{label:"Save the campus emergency number", g:"emergency"},
  classes:{label:"Add your classes to My week", action:"addclass"},
  groups:{label:"Join one club in Hopkins Groups", g:"groups"},
  sis:{label:"Check SIS for holds and your registration date", g:"sis"},
  handshake:{label:"Set up your Handshake profile", g:"handshake"},
  printing:{label:"Register for mobile printing", g:"printing"},
  rec:{label:"Visit the rec center", g:"rec"},
  bluejay:{label:"Try a Blue Jay Shuttle night ride", g:"bluejay"},
};
function checklistIds(p){
  if (!p) return [];
  const ids = [], isNew = p.status === "new";
  if (isNew) ids.push("jhed","wifi","jcard","canvas");
  if (p.intl) ids.push("ois");
  if (realClasses().length === 0) ids.push("classes");
  if (isNew || p.travel?.includes("shuttle") || p.live !== "oncampus") ids.push("transloc");
  ids.push("emergency");
  if (isNew) ids.push("livesafe");
  if (p.live && p.live !== "oncampus") ids.push("bluejay");
  if (!isNew) ids.push("sis");
  if (p.interests?.includes("career")) ids.push("handshake");
  if (p.interests?.includes("clubs") || isNew) ids.push("groups");
  if (p.interests?.includes("fitness")) ids.push("rec");
  if (isNew) ids.push("printing");
  return [...new Set(ids)];
}
function picksFor(p){
  if (!p) return [];
  const t = [], I = p.interests || [], diet = p.diet || [];
  if (p.intl) t.push("International Services (OIS)");
  if (p.level === "masters" || p.level === "phd") t.push("Homewood Graduate Affairs", "Graduate Representative Organization");
  if (p.school === "wse") t.push("Engineering Advising");
  if (p.school === "ksas") t.push("Arts & Sciences Advising");
  if (p.travel?.includes("shuttle") || p.live === "commute") t.push("The JHMI shuttle (\"the Jimmy\")");
  if (p.live && p.live !== "oncampus") t.push("Blue Jay Shuttle & Night Ride", "Safety escort");
  if (I.includes("fitness")) t.push("O'Connor Rec Center");
  if (I.includes("clubs")) t.push("Hopkins Groups");
  if (I.includes("career")) t.push("Handshake", "Life Design Lab");
  if (I.includes("research")) t.push("Sheridan Libraries");
  if (I.includes("arts")) t.push("Baltimore Museum of Art");
  if (I.includes("explore")) t.push("Charm City Circulator", "Inner Harbor");
  if (I.includes("food") || diet.length) t.push("Cheap eats nearby", "Order ahead");
  if (diet.includes("halal")) t.push("Hopkins Café");
  if (I.includes("wellbeing")) t.push("Mental Health Services");
  return [...new Set(t)].map(itemByTitle).filter(Boolean).slice(0, 6);
}

/* ================= next class ================= */
function nextClass(){
  const now = new Date(), d = now.getDay(), m = now.getHours()*60 + now.getMinutes();
  for (let off = 0; off < 7; off++){
    const day = (d + off) % 7;
    const list = classes.filter(c => c.days.includes(day)).sort((a,b) => mins(a.start) - mins(b.start));
    for (const c of list){
      if (off === 0 && mins(c.end) <= m) continue;
      const live = off === 0 && mins(c.start) <= m;
      const startsIn = off === 0 && !live ? mins(c.start) - m : null;
      const when = live ? `Happening now · ends ${fmt(c.end)}` : off === 0 ? `Today at ${fmt(c.start)}` : off === 1 ? `Tomorrow at ${fmt(c.start)}` : `${DAY[day]} at ${fmt(c.start)}`;
      return {c, when, startsIn};
    }
  }
  return null;
}
function classGo(c, cls = "pill light"){
  if (c.mode === "online") return c.link ? `<a class="${cls}" href="${esc(safeUrl(c.link))}" target="_blank" rel="noopener">${svg("video")}Join class</a>` : `<button class="${cls}" type="button" data-edit="${c.id}">${svg("video")}Add meeting link</button>`;
  return `<a class="${cls}" href="${MAPS(c.bldg)}" target="_blank" rel="noopener">${svg("walk")}Walk there</a>`;
}

/* ================= views ================= */
function viewHome(){
  const n = nextClass(), today = new Date().getDay();
  const nextTile = n ? `
      <span class="eyebrow">Up next${n.c.ex ? " · example class" : ""}</span>
      ${n.c.mode === "online" ? `<span class="online-badge">${svg("video",'width="14" height="14"')}Online</span>` : ""}
      <span class="big">${esc(n.c.name)}</span>
      <span class="sub">${esc(n.when)} · ${esc(where(n.c))}</span>
      ${n.startsIn !== null ? `<span class="count">Starts in ${Math.floor(n.startsIn/60) ? Math.floor(n.startsIn/60)+"h " : ""}${n.startsIn%60}m${n.startsIn <= 15 ? (n.c.mode==="online" ? " · time to log on" : " · time to walk") : ""}</span>` : ""}
      <div class="row">${n.c.ex ? `<button class="pill light" type="button" data-addclass>${svg("plus")}Add my classes</button>` : classGo(n.c)}<button class="pill glass" type="button" data-go="week">My week</button></div>`
    : `<span class="eyebrow">Up next</span><span class="big">No classes this week.</span><span class="sub">Add your timetable to see what's next.</span>
       <div class="row"><button class="pill light" type="button" data-addclass>${svg("plus")}Add a class</button></div>`;

  const ids = checklistIds(profile), done = ids.filter(id => doneSet.has(id)).length;
  const pct = ids.length ? Math.round(done / ids.length * 100) : 0;
  const second = profile ? `
    <div class="tile checklist reveal" style="--i:1">
      <div class="cl-head"><div><span class="eyebrow">${profile.status === "new" ? "Your first weeks" : "Your checklist"}</span>
        <span class="cl-count">${done} of ${ids.length} done</span></div>
        <span class="ring" style="--p:${pct}"><span>${pct}%</span></span></div>
      <ul class="cl">${ids.map(id => `<li class="${doneSet.has(id)?"done":""}">
        <button class="tick" type="button" data-tick="${id}" aria-pressed="${doneSet.has(id)}" aria-label="Mark done: ${esc(CHECK[id].label)}">${svg("check")}</button>
        <span>${esc(CHECK[id].label)}</span>
        ${CHECK[id].g ? `<button class="mini" type="button" data-guide="${CHECK[id].g}">How</button>` : `<button class="mini" type="button" data-addclass>Add</button>`}
      </li>`).join("")}</ul>
    </div>`
  : `<div class="tile setup reveal" style="--i:1">
      <span class="eyebrow">Make Blue Jay Buddy yours</span>
      <span class="big2">Five quick questions. One plan made for you.</span>
      <ul class="bul"><li>A checklist for your first weeks or new semester</li><li>Your classes, in person or online, with "up next"</li><li>Picks for your program, home and interests</li></ul>
      <button class="pill primary" type="button" data-wizard>${svg("sparkle")}Make it mine</button>
      <span class="note">About a minute. Stays on this device.</span>
    </div>`;

  const picks = picksFor(profile);
  const favItems = D.items.filter(it => favs.has(it.t));
  const most = D.mostUsed.map(itemByTitle).filter(Boolean);
  const startGuides = profile?.status === "returning" ? ["sis","handshake","printing","bluejay"] : ["use-app","jhed","jcard","transloc"];

  return `
  <section class="dash" aria-label="Today">
    <div class="tile next reveal"><img class="deco" src="assets/icon.svg" alt="">${nextTile}</div>
    ${second}
  </section>

  ${picks.length ? `<section class="io">${head("For you","Picked for you.",`Based on your answers. <button class="linkbtn" type="button" data-wizard>Change answers</button>`)}
    <div class="grid">${picks.map((it,i) => card(it,i)).join("")}</div></section>` : ""}

  ${favItems.length ? `<section class="io">${head("Pinned","Your favorites.","Tap the star on any card to pin it here.")}
    <div class="grid">${favItems.map((it,i) => card(it,i)).join("")}</div></section>` : ""}

  <section class="io">${head("Guides", profile?.status === "returning" ? "Handy how-tos." : "New here? Start here.", "Short, step-by-step and with app links.", `<button class="linkbtn more" type="button" data-tab="guides">All guides ›</button>`)}
    <div class="grid">${startGuides.map((id,i) => guideCard(id,i)).join("")}</div></section>

  ${bento()}

  ${picks.length ? "" : `<section class="io">${head("Every week","Most used.","What students open all the time.")}
    <div class="grid">${most.map((it,i) => card(it,i)).join("")}</div></section>`}

  ${viewWeek()}

  <section class="dash2 io" aria-label="Rec center and sections">
    <div class="tile">
      <span class="eyebrow">O'Connor Rec Center</span>
      <table class="hours">${D.recHours.map((h,i) => `<tr class="${i===today?"today":""}"><td>${DAY[i]}${i===today?" · today":""}</td><td>${h}</td></tr>`).join("")}</table>
      <a class="note" href="https://studentaffairs.jhu.edu/recreation/ralph-s-oconnor-recreation-center/hours-of-operation" target="_blank" rel="noopener">Posted hours. Check today's ›</a>
    </div>
    <div>
      ${head("Explore","Everything else.")}
      <div class="grid explore">${D.sections.map((s,i) => {
        const count = s.id === "map" ? D.buildings.length : D.items.filter(x => x.cat === s.id).length;
        return `<button class="card ecard" type="button" data-tab="${s.id}">
          <span class="badge b-${s.id}">${s.id==="map" ? "MAP" : svg(s.id)}</span>
          <div class="card-body"><h3 class="t">${esc(s.label)}</h3><p class="d">${count} ${s.id==="map"?"buildings":"links"}</p></div></button>`;
      }).join("")}</div>
    </div>
  </section>`;
}

function viewWeek(){
  const today = new Date().getDay(), hasEx = classes.some(c => c.ex);
  return `
  <section id="week" class="io">
    ${head("Schedule","My week.", `${hasEx ? "The two classes shown are examples. Add yours and they disappear. " : ""}Tap Edit to change any class. Saved only on this device.`,
      `<div class="week-actions"><button class="pill primary" type="button" data-addclass>${svg("plus")}Add a class</button><button class="pill secondary" type="button" id="icsBtn">${svg("cal")}Add to my calendar</button></div>`)}
    <div class="week">${[1,2,3,4,5].map(d => {
      const list = classes.filter(c => c.days.includes(d)).sort((a,b) => mins(a.start) - mins(b.start));
      return `<div class="day${d===today?" is-today":""}${list.length?"":" empty"}"><h4>${DAY[d].slice(0,3)}${d===today?" · Today":""}</h4>${list.length ? list.map(c => `
        <div class="cls${c.ex?" example":""}${c.mode==="online"?" online":""}"><b>${esc(c.name)}</b><span class="tm">${fmt(c.start)} – ${fmt(c.end)}</span><span>${c.mode==="online" ? `${svg("video",'width="13" height="13"')} Online` : esc(where(c))}</span>
        <span class="acts">${classGo(c, "mini")}<button class="mini" type="button" data-edit="${c.id}">${svg("edit")}Edit</button></span></div>`).join("") : `<span class="note">Free</span>`}</div>`;
    }).join("")}</div>
  </section>`;
}

/* class form: in person / online / hybrid. Used for add, edit and inside the setup. */
function classForm(px, c = null, compact = false){
  const v = c || {mode:"inperson", days:[], start:"09:00", end:"10:15", bldg:"Malone Hall", room:"", link:""};
  const mode = v.mode || "inperson";
  return `<form class="addc" data-classform="${px}" ${c && !c.ex ? `data-editing="${c.id}"` : ""}>
    <label for="${px}-name">Course name<input id="${px}-name" required placeholder="e.g. Machine Learning" maxlength="60" value="${esc(c && !c.ex ? v.name : "")}"></label>
    <div><span class="lbl">How does it meet?</span><div class="seg" role="radiogroup" aria-label="How does it meet">
      ${[["inperson","In person"],["online","Online"],["hybrid","Hybrid"]].map(([m,l]) => `<label><input type="radio" name="${px}-mode" value="${m}" ${mode===m?"checked":""}><span>${l}</span></label>`).join("")}
    </div></div>
    <div><span class="lbl">Days</span><div class="days" role="group" aria-label="Days">${["Mon","Tue","Wed","Thu","Fri"].map((d,i)=>`<label><input type="checkbox" id="${px}-d${i+1}" value="${i+1}" ${v.days.includes(i+1)?"checked":""}><span>${d}</span></label>`).join("")}</div></div>
    <div class="row2"><label for="${px}-start">Starts<input id="${px}-start" type="time" required value="${esc(v.start)}"></label><label for="${px}-end">Ends<input id="${px}-end" type="time" required value="${esc(v.end)}"></label></div>
    <div class="row2" data-show="place" ${mode==="online"?"hidden":""}>
      <label for="${px}-bldg">Building<select id="${px}-bldg">${D.buildings.map(([b])=>`<option ${b===v.bldg?"selected":""}>${esc(b)}</option>`).join("")}</select></label>
      <label for="${px}-room">Room<input id="${px}-room" placeholder="e.g. 228" maxlength="12" value="${esc(v.room||"")}"></label>
    </div>
    <label for="${px}-link" data-show="link" ${mode==="inperson"?"hidden":""}>Meeting link <span class="note">(Zoom, Teams…) optional</span><input id="${px}-link" type="url" inputmode="url" placeholder="https://jhubluejays.zoom.us/j/…" value="${esc(v.link||"")}"></label>
    ${compact ? "" : `<label for="${px}-until">Last day of classes<input id="${px}-until" type="date" value="${esc(store.get("bjb-until","2026-12-11"))}"></label>`}
    <div class="sheet-actions">
      <button class="pill primary" type="submit">${c && !c.ex ? `${svg("check")}Save changes` : `${svg("plus")}Add class`}</button>
      ${c && !c.ex && !compact ? `<button class="pill ghost" type="button" data-del="${c.id}">${svg("trash")}Delete</button>` : ""}
    </div>
    <span class="note msg" role="status"></span>
  </form>`;
}
function classSheet(c = null){
  openSheet(`${c ? "" : ""}<div class="wiz-top"><span class="eyebrow">${c ? "Edit class" : "New class"}</span><button class="iconx" type="button" data-close aria-label="Close">${svg("close")}</button></div>
    <h2 id="sheetTitle">${c ? esc(c.name) : "Add a class"}</h2>${classForm("cf", c)}`);
}

function viewGuides(){
  const groups = [["start","Start here","New to Hopkins? Do these first."],["everyday","Everyday","Things you will do every week."],["health","Health and safety","Read these before you need them."]];
  return `<section>${head("Guides","How to do anything at Hopkins.","Step-by-step help with app download links, written for new and returning students.")}</section>
  ${groups.map(([g,label,sub]) => `<section class="io"><h3 class="subhead">${label} <span class="note">· ${sub}</span></h3><div class="grid">${Object.keys(G).filter(id => G[id].group === g).map((id,i) => guideCard(id,i)).join("")}</div></section>`).join("")}`;
}
function viewSection(id){
  const s = D.sections.find(x => x.id === id);
  const body = id === "map" ? D.buildings.map((b,i) => bCard(b,i)).join("") : D.items.filter(i => i.cat === id).map((it,i) => card(it,i)).join("");
  const related = id === "map" ? [] : [...new Set(D.items.filter(i => i.cat === id && i.g).map(i => i.g))];
  return `<section>${head(s.label, esc(s.label) + ".", esc(s.intro))}<div class="grid">${body}</div></section>
  ${id === "academics" ? viewWeek() : ""}
  ${id === "map" ? bento() : ""}
  ${related.length ? `<section class="io"><h3 class="subhead">How-to guides</h3><div class="grid">${related.map((g,i) => guideCard(g,i)).join("")}</div></section>` : ""}`;
}
function viewSearch(q){
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hit = h => words.every(w => h.includes(w));
  const score = (title, h) => hit(h) ? words.reduce((s,w) => s + (title.toLowerCase().includes(w) ? 3 : 1), 0) : -1;
  const items = D.items.map(it => [it, score(it.t, (it.t+" "+it.d+" "+(it.k||"")+" "+it.cat).toLowerCase())]).filter(x => x[1] >= 0).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const guides = Object.keys(G).map(id => [id, score(G[id].title, (G[id].title+" "+G[id].who+" "+strip(G[id].steps.join(" "))+" "+(G[id].apps||[]).map(a=>a.name).join(" ")).toLowerCase())]).filter(x => x[1] >= 0).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const blds = D.buildings.filter(b => hit((b[0]+" "+b[1]).toLowerCase()));
  const total = items.length + guides.length + blds.length;
  if (!total) return `<div class="empty">Nothing matches "${esc(q)}".<br>Try a simpler word like "shuttle", "food", "ID", "print" or a building name.</div>`;
  return `<section>${head("Search", `Results for “${esc(q)}”.`, `${total} found. Press Esc to clear.`)}
    ${guides.length ? `<h3 class="subhead">Guides</h3><div class="grid">${guides.slice(0,6).map((g,i) => guideCard(g,i,words)).join("")}</div>` : ""}
    ${items.length ? `<h3 class="subhead" style="margin-top:28px">Places and links</h3><div class="grid">${items.map((it,i) => card(it,i,words)).join("")}</div>` : ""}
    ${blds.length ? `<h3 class="subhead" style="margin-top:28px">Buildings</h3><div class="grid">${blds.map((b,i) => bCard(b,i,words)).join("")}</div>` : ""}</section>`;
}

/* ================= render ================= */
let io = null;
if ("IntersectionObserver" in window && !reduced()){
  document.documentElement.classList.add("js-io");
  io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }), {rootMargin:"0px 0px -8% 0px", threshold:.05});
}
function renderTabs(q){
  $("#tabs").innerHTML = [["home","Home"],["guides","Guides"], ...D.sections.map(s => [s.id, s.label])]
    .map(([id,l]) => `<button class="tab" role="tab" type="button" data-tab="${id}" aria-selected="${!q && id===tab}">${esc(l)}</button>`).join("");
  $$(".bottombar button").forEach(b => b.classList.toggle("on", !q && b.dataset.go === tab));
  const sel = $(`.tab[aria-selected="true"]`); if (sel) sel.scrollIntoView({block:"nearest", inline:"center"});
}
function render(quiet = false){
  const q = $("#q").value.trim();
  renderTabs(q);
  $("#main").classList.toggle("calm", quiet);
  $("#main").innerHTML = q ? viewSearch(q) : tab === "home" ? viewHome() : tab === "guides" ? viewGuides() : viewSection(tab);
  $$("#main .io").forEach(el => { if (quiet || !io) el.classList.add("in"); else io.observe(el); });
  setSky(); heroCta();
}
function go(t, scroll = true){
  tab = t; $("#q").value = "";
  history.replaceState(null, "", t === "home" ? location.pathname : "#" + t);
  render();
  if (scroll) $(".tabs").scrollIntoView({behavior: reduced() ? "auto" : "smooth"});
}

/* ================= toast / copy ================= */
let toastT;
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200); }
async function copy(text){ try { await navigator.clipboard.writeText(text); toast("Copied " + text); } catch { toast(text); } }

/* ================= sheet (popup) ================= */
const sheet = $("#sheet"), sheetBody = $("#sheetBody");
let lastFocus = null;
function openSheet(html, cls = ""){
  if (!sheet.open) lastFocus = document.activeElement;
  sheetBody.innerHTML = html;
  sheet.className = "sheet " + cls;
  if (!sheet.open) sheet.showModal();
  sheetBody.scrollTop = 0;
  const f = sheetBody.querySelector("[autofocus], .primary, input, button, a"); if (f) f.focus({preventScroll:true});
}
function closeSheet(){
  if (!sheet.open) return;
  sheet.classList.add("closing");
  setTimeout(() => { sheet.close(); sheet.classList.remove("closing"); lastFocus?.focus?.({preventScroll:true}); }, reduced() ? 0 : 200);
}
sheet.addEventListener("click", e => { if (e.target === sheet) closeSheet(); });
sheet.addEventListener("cancel", e => { e.preventDefault(); closeSheet(); });

function callSheet(label, num){
  const red = /emergenc/i.test(label);
  openSheet(`<div class="call-sheet">
      <span class="call-ic ${red ? "red" : ""}">${svg("phone")}</span>
      <span class="eyebrow">Confirm call</span>
      <h2 id="sheetTitle">${esc(label)}</h2>
      <p class="num">${esc(num)}</p>
      <p class="note">Tap Call now to dial. On a laptop, dial this number on your phone.</p>
      <div class="sheet-actions">
        <a class="pill primary big ${red ? "danger" : ""}" href="${telOf(num)}" data-confirmed="1">${svg("phone")}Call now</a>
        <button class="pill secondary" type="button" data-copy="${esc(num)}">${svg("copy")}Copy number</button>
        <button class="pill ghost" type="button" data-close>Cancel</button>
      </div></div>`, "small");
}
function guideSheet(id){
  const g = G[id]; if (!g) return;
  const cid = Object.keys(CHECK).find(k => CHECK[k].g === id);
  const canTick = profile && cid && checklistIds(profile).includes(cid);
  openSheet(`
    <div class="g-hero"><span class="badge b-guide">${svg("guide")}</span></div>
    <div class="g-head"><span class="eyebrow">Guide · ${esc(g.time)}</span><h2 id="sheetTitle">${esc(g.title)}</h2><p class="note">For: ${esc(g.who)}</p></div>
    ${g.apps ? `<div class="apps">${g.apps.map(a => `<div><span>Get the <b>${esc(a.name)}</b> app</span><div class="stores">
        <a class="store" href="${esc(a.ios)}" target="_blank" rel="noopener">${svg("apple")}<span><small>Download on the</small>App Store</span></a>
        <a class="store" href="${esc(a.android)}" target="_blank" rel="noopener">${svg("play")}<span><small>Get it on</small>Google Play</span></a></div></div>`).join("")}</div>` : ""}
    <ol class="steps">${g.steps.map(s => `<li>${s}</li>`).join("")}</ol>
    ${g.tips ? `<div class="tips"><span class="eyebrow">Good to know</span><ul>${g.tips.map(t => `<li>${t}</li>`).join("")}</ul></div>` : ""}
    ${g.phones ? `<div class="g-phones">${g.phones.map(p => `<span class="phone"><b>${esc(p.t)}</b> ${esc(p.p)}<a class="mini call" href="${telOf(p.p)}" data-label="${esc(p.t)}" data-num="${esc(p.p)}">${svg("phone")}Call</a></span>`).join("")}</div>` : ""}
    <div class="sheet-actions">
      ${g.link ? `<a class="pill primary" href="${esc(g.link.u)}" target="_blank" rel="noopener">${esc(g.link.t)} ${svg("open")}</a>` : ""}
      ${canTick ? `<button class="pill secondary" type="button" data-tick="${cid}" data-close-after>${doneSet.has(cid) ? `${svg("check")}Done` : "Mark as done"}</button>` : ""}
      <button class="pill ghost" type="button" data-close>Close</button>
    </div>`);
}
function settingsSheet(){
  openSheet(`<div class="wiz-top"><span class="eyebrow">Settings</span><button class="iconx" type="button" data-close aria-label="Close">${svg("close")}</button></div>
    <h2 id="sheetTitle">Your data</h2>
    <p class="note">Everything Blue Jay Buddy remembers lives only in this browser. Nothing is uploaded.</p>
    <div class="sheet-actions" style="flex-direction:column">
      <button class="pill primary" type="button" data-wizard>${svg("edit")}Edit my plan</button>
      <button class="pill secondary" type="button" data-addclass>${svg("plus")}Add a class</button>
      <button class="pill ghost" type="button" data-reset="classes">Remove all my classes</button>
      <button class="pill ghost" type="button" data-reset="all">Reset everything</button>
    </div>`, "small");
}
function confirmReset(kind){
  openSheet(`<div class="call-sheet"><span class="call-ic red">${svg("trash")}</span>
    <h2 id="sheetTitle">${kind === "all" ? "Reset everything?" : "Remove all classes?"}</h2>
    <p class="note">${kind === "all" ? "Your plan, classes, checklist and favorites will be cleared from this browser." : "Your classes will be cleared from this browser."} This can't be undone.</p>
    <div class="sheet-actions"><button class="pill danger" type="button" data-reset-yes="${kind}">${kind === "all" ? "Reset everything" : "Remove classes"}</button><button class="pill ghost" type="button" data-close>Cancel</button></div></div>`, "small");
}

/* ================= setup wizard ================= */
let draft = null, step = 0;
const STEPS = ["About you","Your program","Getting around","Your classes","Interests"];
const chip = (name, value, label, type = "radio", checked = false) => `<label class="opt"><input type="${type}" name="${name}" value="${value}" ${checked ? "checked" : ""}><span>${label}</span></label>`;
function wizStepHTML(){
  const p = draft, has = (k, v) => Array.isArray(p[k]) ? p[k].includes(v) : p[k] === v;
  let body = "";
  if (step === 0) body = `
    <label class="field" for="w-name">What should we call you? <span class="opt-tag">Optional</span><input id="w-name" value="${esc(p.name||"")}" placeholder="First name" maxlength="30" autocomplete="given-name"></label>
    <fieldset><legend>Are you new to Hopkins?</legend><div class="opts">${chip("status","new","I'm new this year","radio",has("status","new"))}${chip("status","returning","I've been here before","radio",has("status","returning"))}</div></fieldset>`;
  if (step === 1) body = `
    <fieldset><legend>Your program</legend><div class="opts">${chip("level","undergrad","Undergraduate","radio",has("level","undergrad"))}${chip("level","masters","Master's","radio",has("level","masters"))}${chip("level","phd","PhD","radio",has("level","phd"))}${chip("level","other","Other","radio",has("level","other"))}</div></fieldset>
    <fieldset><legend>Your school</legend><div class="opts">${chip("school","wse","Engineering (Whiting)","radio",has("school","wse"))}${chip("school","ksas","Arts & Sciences (Krieger)","radio",has("school","ksas"))}${chip("school","other","Another school","radio",has("school","other"))}</div></fieldset>
    <fieldset><legend>Are you an international student (F-1 or J-1)?</legend><div class="opts">${chip("intl","yes","Yes","radio",p.intl === true)}${chip("intl","no","No","radio",p.intl === false)}</div></fieldset>`;
  if (step === 2) body = `
    <fieldset><legend>Where do you live?</legend><div class="opts">${chip("live","oncampus","On-campus housing","radio",has("live","oncampus"))}${chip("live","nearby","Off campus, near Homewood","radio",has("live","nearby"))}${chip("live","commute","Farther away, I commute","radio",has("live","commute"))}</div></fieldset>
    <fieldset><legend>How do you get around? <span class="opt-tag">Pick any</span></legend><div class="opts">${[["walk","Walk"],["shuttle","JHU shuttles"],["bus","City bus"],["bike","Bike or scooter"],["car","Car"]].map(([v,l]) => chip("travel",v,l,"checkbox",has("travel",v))).join("")}</div></fieldset>`;
  if (step === 3) body = `
    <p class="note">Add each class once, in person or online. You can skip this and add or edit classes anytime.</p>
    <ul class="wiz-classes">${realClasses().map(c => `<li><span class="grow"><b>${esc(c.name)}</b> · ${c.days.map(d=>DAY[d].slice(0,3)).join(", ")} · ${fmt(c.start)} · ${esc(where(c))}</span><button class="mini danger" type="button" data-del="${c.id}">Remove</button></li>`).join("") || `<li class="note">No classes yet.</li>`}</ul>
    ${classForm("wc", null, true)}`;
  if (step === 4) body = `
    <fieldset><legend>What are you into? <span class="opt-tag">Pick any</span></legend><div class="opts">${[["fitness","Fitness & sports"],["clubs","Clubs & events"],["career","Jobs & internships"],["research","Research & study"],["arts","Arts & culture"],["explore","Exploring Baltimore"],["food","Good cheap food"],["wellbeing","Wellbeing"]].map(([v,l]) => chip("interests",v,l,"checkbox",has("interests",v))).join("")}</div></fieldset>
    <fieldset><legend>Food needs <span class="opt-tag">Optional</span></legend><div class="opts">${[["vegetarian","Vegetarian"],["vegan","Vegan"],["halal","Halal"],["kosher","Kosher"]].map(([v,l]) => chip("diet",v,l,"checkbox",has("diet",v))).join("")}</div></fieldset>`;
  return `<div class="wiz">
      <div class="wiz-top"><span class="eyebrow">Make it mine · Step ${step+1} of ${STEPS.length}</span><button class="iconx" type="button" data-close aria-label="Close setup">${svg("close")}</button></div>
      <div class="dots" aria-hidden="true">${STEPS.map((s,i) => `<span class="${i<=step?"on":""}"></span>`).join("")}</div>
      <h2 id="sheetTitle">${STEPS[step]}</h2>
      <div id="wizForm" class="wiz-body">${body}</div>
      <div class="sheet-actions wiz-nav">
        ${step > 0 ? `<button class="pill ghost" type="button" data-wiz="back">Back</button>` : `<span></span>`}
        <button class="pill primary" type="button" data-wiz="next">${step === STEPS.length - 1 ? `${svg("check")}Build my plan` : "Continue"}</button>
      </div></div>`;
}
function readWizStep(){
  const f = $("#wizForm"); if (!f) return;
  const val = n => f.querySelector(`input[name="${n}"]:checked`)?.value;
  const vals = n => [...f.querySelectorAll(`input[name="${n}"]:checked`)].map(i => i.value);
  if (step === 0){ draft.name = $("#w-name").value.trim(); draft.status = val("status") || draft.status; }
  if (step === 1){ draft.level = val("level") || draft.level; draft.school = val("school") || draft.school; const i = val("intl"); if (i) draft.intl = i === "yes"; }
  if (step === 2){ draft.live = val("live") || draft.live; draft.travel = vals("travel"); }
  if (step === 4){ draft.interests = vals("interests"); draft.diet = vals("diet"); }
}
function openWizard(){
  draft = Object.assign({status:"new", level:"", school:"", intl:undefined, live:"", travel:[], interests:[], diet:[]}, profile || {});
  step = 0; openSheet(wizStepHTML(), "wizard");
}
function wizGo(dir){
  readWizStep();
  if (dir === "next" && step === STEPS.length - 1){
    profile = Object.assign({}, draft); store.set("bjb-profile", profile);
    closeSheet(); tab = "home"; history.replaceState(null, "", location.pathname); render();
    toast(profile.name ? `Your plan is ready, ${profile.name}` : "Your plan is ready");
    setTimeout(() => $("#main").scrollIntoView({behavior: reduced() ? "auto" : "smooth"}), 250);
    return;
  }
  step += dir === "next" ? 1 : -1;
  sheetBody.innerHTML = wizStepHTML(); sheetBody.scrollTop = 0;
}

/* ================= calendar export ================= */
function exportICS(){
  const real = realClasses();
  if (!real.length){ toast("Add your own classes first"); return; }
  const until = (store.get("bjb-until","2026-12-11")).replace(/-/g,"");
  const BY = ["SU","MO","TU","WE","TH","FR","SA"], pad = n => String(n).padStart(2,"0");
  const stamp = new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"");
  const clean = s => String(s).replace(/[,;\\]/g," ");
  const first = days => { const d = new Date(); for (let i=0;i<7;i++){ const x = new Date(d); x.setDate(d.getDate()+i); if (days.includes(x.getDay())) return x; } return d; };
  const L = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Blue Jay Buddy//EN","CALSCALE:GREGORIAN",
    "BEGIN:VTIMEZONE","TZID:America/New_York","BEGIN:DAYLIGHT","TZOFFSETFROM:-0500","TZOFFSETTO:-0400","TZNAME:EDT","DTSTART:19700308T020000","RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU","END:DAYLIGHT",
    "BEGIN:STANDARD","TZOFFSETFROM:-0400","TZOFFSETTO:-0500","TZNAME:EST","DTSTART:19701101T020000","RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU","END:STANDARD","END:VTIMEZONE"];
  real.forEach(c => {
    const f = first(c.days), ymd = `${f.getFullYear()}${pad(f.getMonth()+1)}${pad(f.getDate())}`;
    L.push("BEGIN:VEVENT",`UID:bjb-${c.id}@bluejaybuddy`,`DTSTAMP:${stamp}`,`DTSTART;TZID=America/New_York:${ymd}T${c.start.replace(":","")}00`,
      `DTEND;TZID=America/New_York:${ymd}T${c.end.replace(":","")}00`,`RRULE:FREQ=WEEKLY;BYDAY=${c.days.map(d=>BY[d]).join(",")};UNTIL=${until}T235959Z`,
      `SUMMARY:${clean(c.name)}`,`LOCATION:${clean(c.mode === "online" ? "Online" : c.bldg + (c.room ? " " + c.room : ""))}`);
    if (c.link) L.push(`URL:${safeUrl(c.link)}`, `DESCRIPTION:Join: ${clean(safeUrl(c.link))}`);
    L.push("END:VEVENT");
  });
  L.push("END:VCALENDAR");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([L.join("\r\n")], {type:"text/calendar"})); a.download = "my-jhu-classes.ics";
  document.body.appendChild(a); a.click(); a.remove();
  openSheet(`<div class="call-sheet"><span class="call-ic ok">${svg("check")}</span><h2 id="sheetTitle">Calendar file downloaded</h2>
    <ol class="steps"><li><b>iPhone or Mac:</b> open the file and tap <b>Add All</b>.</li><li><b>Google Calendar:</b> on a computer, open Settings → Import &amp; export → Import, and choose the file.</li><li><b>Outlook:</b> open the file, or use Add calendar → Upload from file.</li></ol>
    <div class="sheet-actions"><button class="pill primary" type="button" data-close>Done</button></div></div>`, "small");
}

/* ================= events ================= */
// Calls always ask first: the first tap opens a confirm popup; "Call now" inside it dials.
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="tel:"]');
  if (a && !a.dataset.confirmed){
    e.preventDefault();
    const label = a.dataset.label || a.textContent.trim() || "this number";
    const num = a.dataset.num || a.getAttribute("href").slice(4).replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    callSheet(label, num);
  } else if (a && a.dataset.confirmed){ setTimeout(closeSheet, 500); }
}, true);

document.addEventListener("change", e => {
  const r = e.target.closest('input[type="radio"][name$="-mode"]'); if (!r) return;
  const f = r.closest("form");
  f.querySelector('[data-show="place"]').hidden = r.value === "online";
  f.querySelector('[data-show="link"]').hidden = r.value === "inperson";
});

document.addEventListener("click", e => {
  const T = sel => e.target.closest(sel);
  let el;
  if ((el = T("[data-close]"))){ closeSheet(); return; }
  if ((el = T("[data-wizard]"))){ e.preventDefault(); openWizard(); return; }
  if ((el = T("[data-wiz]"))){ wizGo(el.dataset.wiz); return; }
  if ((el = T("[data-guide]"))){ guideSheet(el.dataset.guide); return; }
  if ((el = T("[data-settings]"))){ settingsSheet(); return; }
  if ((el = T("[data-addclass]"))){ classSheet(null); return; }
  if ((el = T("[data-edit]"))){ const c = classes.find(x => String(x.id) === el.dataset.edit); if (c) classSheet(c.ex ? null : c); return; }
  if ((el = T("[data-reset]"))){ confirmReset(el.dataset.reset); return; }
  if ((el = T("[data-reset-yes]"))){
    if (el.dataset.resetYes === "all"){ ["bjb-profile","bjb-favs","bjb-done","bjb-classes","bjb-until"].forEach(store.del); profile = null; favs = new Set(); doneSet = new Set(); }
    else store.set("bjb-classes", []);
    classes = store.get("bjb-classes", null) ?? [];
    if (el.dataset.resetYes === "all") classes = [];
    closeSheet(); render(); toast("Done. Fresh start."); return;
  }
  if ((el = T("[data-tab]"))){ e.preventDefault(); if (sheet.open) closeSheet(); go(el.dataset.tab); return; }
  if ((el = T("[data-go]"))){
    const w = el.dataset.go;
    if (sheet.open) closeSheet();
    if (w === "week"){ if (tab !== "home" || $("#q").value) go("home", false); setTimeout(() => $("#week")?.scrollIntoView({behavior: reduced() ? "auto" : "smooth"}), 60); }
    else go(w);
    return;
  }
  if ((el = T("[data-copy]"))){ e.preventDefault(); copy(el.dataset.copy); return; }
  if ((el = T("[data-tick]"))){
    const id = el.dataset.tick, on = !doneSet.has(id);
    on ? doneSet.add(id) : doneSet.delete(id); store.set("bjb-done", [...doneSet]);
    if (on) toast("Nice, one more done");
    if (el.hasAttribute("data-close-after")) closeSheet();
    if (tab === "home" && !$("#q").value) render(true);
    return;
  }
  if ((el = T("[data-fav]"))){
    const id = el.dataset.fav, on = !favs.has(id);
    on ? favs.add(id) : favs.delete(id); store.set("bjb-favs", [...favs]);
    el.setAttribute("aria-pressed", on); el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
    toast(on ? "Pinned to your home screen" : "Removed from favorites");
    if (tab === "home" && !$("#q").value) setTimeout(() => render(true), 300);
    return;
  }
  if ((el = T("[data-del]"))){
    classes = classes.filter(x => String(x.id) !== el.dataset.del && !x.ex);
    saveClasses(); toast("Class removed");
    if (sheet.open && sheet.classList.contains("wizard")) sheetBody.innerHTML = wizStepHTML();
    else { if (sheet.open) closeSheet(); render(true); }
    return;
  }
  if (T("#icsBtn")) exportICS();
  if (T("#searchBtn")){ window.scrollTo({top:0, behavior: reduced() ? "auto" : "smooth"}); setTimeout(() => $("#q").focus(), 300); }
});

document.addEventListener("submit", e => {
  const f = e.target.closest("[data-classform]"); if (!f) return;
  e.preventDefault();
  const px = f.dataset.classform, g = id => document.getElementById(`${px}-${id}`), msg = f.querySelector(".msg");
  const mode = f.querySelector(`input[name="${px}-mode"]:checked`)?.value || "inperson";
  const days = [1,2,3,4,5].filter(d => g("d"+d).checked);
  if (!days.length){ msg.textContent = "Pick at least one day."; return; }
  if (mins(g("end").value) <= mins(g("start").value)){ msg.textContent = "The end time must be after the start time."; return; }
  const link = g("link").value.trim();
  if (link && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(link)){ msg.textContent = "That meeting link doesn't look right. Paste the full link."; return; }
  if (g("until")) store.set("bjb-until", g("until").value);
  const data = {name:g("name").value.trim(), mode, days, start:g("start").value, end:g("end").value,
    bldg: mode === "online" ? "" : g("bldg").value, room: mode === "online" ? "" : g("room").value.trim(), link: mode === "inperson" ? "" : link};
  classes = classes.filter(c => !c.ex);
  if (f.dataset.editing){ const c = classes.find(x => String(x.id) === f.dataset.editing); Object.assign(c, data); toast("Changes saved"); }
  else { classes.push(Object.assign({id:Date.now()}, data)); toast(`Added ${data.name}`); }
  saveClasses();
  if (px === "wc"){ sheetBody.innerHTML = wizStepHTML(); }
  else { closeSheet(); render(true); setTimeout(() => $("#week")?.scrollIntoView({behavior: reduced() ? "auto" : "smooth"}), 220); }
});

let tmr;
$("#q").addEventListener("input", () => { clearTimeout(tmr); tmr = setTimeout(() => { render(); }, 120); });
$("#q").addEventListener("keydown", e => {
  if (e.key === "Escape"){ $("#q").value = ""; render(); $("#q").blur(); }
  if (e.key === "Enter"){ $(".tabs").scrollIntoView({behavior: reduced() ? "auto" : "smooth"}); $("#q").blur(); }
});
document.addEventListener("keydown", e => {
  if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !sheet.open){ e.preventDefault(); window.scrollTo({top:0, behavior:"smooth"}); $("#q").focus(); }
});
window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (validTabs.includes(h) && h !== tab){ tab = h; render(); } });

/* ================= boot ================= */
renderQuick(); render();
if (!profile && !store.get("bjb-welcomed", false)){
  store.set("bjb-welcomed", true);
  setTimeout(() => {
    if (sheet.open) return;
    openSheet(`<div class="call-sheet welcome">
      <div class="welcome-hero"><img class="bg" src="${PH.keyser.src(900)}" alt="" ${onImg}><img class="logo" src="assets/icon.svg" alt=""></div>
      <h2 id="sheetTitle">Welcome to Blue Jay Buddy</h2>
      <p>Classes, shuttles, food, buildings, safety numbers and step-by-step guides for Hopkins Homewood. No login, nothing to install.</p>
      <div class="sheet-actions"><button class="pill primary big" type="button" data-wizard>${svg("sparkle")}Make it mine</button>
      <button class="pill ghost" type="button" data-close>Just look around</button></div></div>`, "small");
  }, 1100);
}
setInterval(() => { if (tab === "home" && !$("#q").value && !sheet.open && !document.activeElement.closest?.("form")) render(true); }, 60000);
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();

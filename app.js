(() => {
"use strict";
const D = window.BJB, G = window.BJB_GUIDES, MAPS = D.maps;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const strip = s => String(s).replace(/<[^>]+>/g, "");
const DAY = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

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
};
const svg = (name, attrs = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${ICON[name]}</svg>`;
const initials = n => n.replace(/^(Ralph S\.|Milton S\.)\s*/,"").split(/\s+/).filter(w=>/^[A-Z]/.test(w)).slice(0,2).map(w=>w[0]).join("");
const telOf = p => "tel:" + p.replace(/\D/g, "");

/* ================= state ================= */
let profile = store.get("bjb-profile", null);
let favs = new Set(store.get("bjb-favs", []));
let doneSet = new Set(store.get("bjb-done", []));
let classes = store.get("bjb-classes", null);
const exampleClasses = () => [
  {id:1,name:"Data Structures",days:[1,3],start:"10:30",end:"11:45",bldg:"Malone Hall",room:"228",ex:true},
  {id:2,name:"Applied Statistics",days:[2,4],start:"13:30",end:"14:45",bldg:"Hodson Hall",room:"110",ex:true},
];
if (classes === null) classes = exampleClasses();
const realClasses = () => classes.filter(c => !c.ex);
const saveClasses = () => store.set("bjb-classes", classes);

const validTabs = ["home", "guides", ...D.sections.map(s => s.id)];
let tab = validTabs.includes(location.hash.slice(1)) ? location.hash.slice(1) : "home";

/* ================= theme + sky ================= */
function applyTheme(t){ t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }
applyTheme(store.get("bjb-theme", null));
$("#themeBtn").addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark" ||
    (!document.documentElement.hasAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  const next = dark ? "light" : "dark";
  applyTheme(next); store.set("bjb-theme", next); toast(next === "dark" ? "Dark mode on" : "Light mode on");
});
function setSky(){
  const h = new Date().getHours();
  document.body.dataset.sky = h >= 5 && h < 8 ? "dawn" : h >= 8 && h < 17 ? "day" : h >= 17 && h < 20 ? "dusk" : "night";
  const g = h < 5 ? "Up late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good night";
  const who = profile?.name ? profile.name : "Blue Jay";
  $("#greet").textContent = `${g}, ${who} · ${new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}`;
}
function heroCta(){
  $("#planBtn").innerHTML = profile ? `${svg("sparkle")}Edit my plan` : `${svg("sparkle")}Make it mine <span class="pill">1 min</span>`;
}

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
        <a class="act" href="${esc(it.u)}" target="_blank" rel="noopener">${svg("open")}Open</a>
        ${it.g && G[it.g] ? `<button class="act soft" type="button" data-guide="${it.g}">${svg("guide")}How to</button>` : ""}
      </div>
    </div>
    <button class="star" type="button" data-fav="${esc(it.t)}" aria-pressed="${fav}" aria-label="${fav?"Remove from":"Add to"} favorites: ${esc(it.t)}">${svg("star")}</button>
  </article>`;
}
function bCard([n, type], i = 0, words = []){
  return `<a class="card bcard reveal" style="--i:${i}" href="${MAPS(n)}" target="_blank" rel="noopener">
    <span class="badge b-map">${esc(initials(n))}</span>
    <div class="card-body"><h3 class="t">${highlight(n, words)}</h3><div class="meta"><span class="chip">${esc(type)}</span><span class="note">${svg("walk",'width="14" height="14"')} Directions</span></div></div>
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
  classes:{label:"Add your classes to My week", action:"week"},
  groups:{label:"Join one club in Hopkins Groups", g:"groups"},
  sis:{label:"Check SIS for holds and your registration date", g:"sis"},
  handshake:{label:"Set up your Handshake profile", g:"handshake"},
  printing:{label:"Register for mobile printing", g:"printing"},
  rec:{label:"Visit the rec center", g:"rec"},
  bluejay:{label:"Try a Blue Jay Shuttle night ride", g:"bluejay"},
};
function checklistIds(p){
  if (!p) return [];
  const ids = [];
  const isNew = p.status === "new";
  if (isNew) ids.push("jhed","wifi","jcard","canvas");
  if (p.intl) ids.push("ois");
  if (realClasses().length === 0) ids.push("classes");
  if (isNew || p.travel?.includes("shuttle") || p.live !== "oncampus") ids.push("transloc");
  ids.push("emergency");
  if (isNew) ids.push("livesafe");
  if (p.live !== "oncampus") ids.push("bluejay");
  if (!isNew) ids.push("sis");
  if (p.interests?.includes("career")) ids.push("handshake");
  if (p.interests?.includes("clubs") || isNew) ids.push("groups");
  if (p.interests?.includes("fitness")) ids.push("rec");
  if (isNew) ids.push("printing");
  return [...new Set(ids)];
}
function picksFor(p){
  if (!p) return [];
  const t = [];
  const I = p.interests || [], diet = p.diet || [];
  if (p.intl) t.push("International Services (OIS)");
  if (p.level === "masters" || p.level === "phd") t.push("Homewood Graduate Affairs", "Graduate Representative Organization");
  if (p.school === "wse") t.push("Engineering Advising");
  if (p.school === "ksas") t.push("Arts & Sciences Advising");
  if (p.travel?.includes("shuttle") || p.live === "commute") t.push("The JHMI shuttle (\"the Jimmy\")");
  if (p.live !== "oncampus") t.push("Blue Jay Shuttle & Night Ride", "Safety escort");
  if (I.includes("fitness")) t.push("O'Connor Rec Center");
  if (I.includes("clubs")) t.push("Hopkins Groups");
  if (I.includes("career")) t.push("Handshake", "Life Design Lab");
  if (I.includes("research")) t.push("Sheridan Libraries");
  if (I.includes("arts")) t.push("Baltimore Museum of Art");
  if (I.includes("explore")) t.push("Charm City Circulator", "Inner Harbor");
  if (I.includes("food") || diet.length) t.push("Cheap eats nearby", "Order ahead");
  if (diet.includes("halal")) t.push("Hopkins Café");
  if (I.includes("wellbeing")) t.push("Mental Health Services");
  return [...new Set(t)].map(itemByTitle).filter(Boolean).slice(0, 8);
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

/* ================= views ================= */
function viewHome(){
  const n = nextClass(), today = new Date().getDay();
  const nextTile = n ? `
      <span class="eyebrow">Up next${n.c.ex ? " · example" : ""}</span>
      <span class="big">${esc(n.c.name)}</span>
      <span class="sub">${esc(n.when)} · ${esc(n.c.bldg)}${n.c.room ? ", room "+esc(n.c.room) : ""}</span>
      ${n.startsIn !== null ? `<span class="count">starts in ${Math.floor(n.startsIn/60) ? Math.floor(n.startsIn/60)+"h " : ""}${n.startsIn%60}m${n.startsIn <= 15 ? " · time to walk" : ""}</span>` : ""}
      <div class="row"><a class="btn-w" href="${MAPS(n.c.bldg)}" target="_blank" rel="noopener">${svg("walk",'width="16" height="16"')}Walk there</a><button class="btn-w ghost" type="button" data-go="week">${n.c.ex ? "Add my classes" : "My week"}</button></div>`
    : `<span class="eyebrow">Up next</span><span class="big">No classes this week</span><span class="sub">Add your timetable to see what's next.</span>
       <div class="row"><button class="btn-w" type="button" data-go="week">Add a class</button></div>`;

  const ids = checklistIds(profile), done = ids.filter(id => doneSet.has(id)).length;
  const pct = ids.length ? Math.round(done / ids.length * 100) : 0;
  const second = profile ? `
    <div class="tile checklist reveal" style="--i:1">
      <div class="cl-head"><div><span class="eyebrow">${profile.status === "new" ? "Your first-weeks checklist" : "Your checklist"}</span>
        <span class="cl-count">${done} of ${ids.length} done</span></div>
        <span class="ring" style="--p:${pct}"><span>${pct}%</span></span></div>
      <ul class="cl">${ids.map(id => `<li class="${doneSet.has(id)?"done":""}">
        <button class="tick" type="button" data-tick="${id}" aria-pressed="${doneSet.has(id)}" aria-label="Mark done: ${esc(CHECK[id].label)}">${svg("check")}</button>
        <span>${esc(CHECK[id].label)}</span>
        ${CHECK[id].g ? `<button class="mini" type="button" data-guide="${CHECK[id].g}">How</button>` : `<button class="mini" type="button" data-go="${CHECK[id].action}">Open</button>`}
      </li>`).join("")}</ul>
    </div>`
  : `<div class="tile setup reveal" style="--i:1">
      <span class="eyebrow">Make Blue Jay Buddy yours</span>
      <span class="big2">Answer 5 quick questions and get your own plan.</span>
      <ul class="bul"><li>A checklist for your first weeks or new semester</li><li>Your classes with "up next" and directions</li><li>Picks for your program, home and interests</li></ul>
      <button class="btn" type="button" data-wizard>${svg("sparkle",'width="18" height="18"')}Make it mine</button>
      <span class="note">Takes about a minute. Stays on this device.</span>
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

  ${picks.length ? `<section aria-labelledby="h-picks"><div class="sec-head"><div><h2 id="h-picks">Picked for you</h2><p class="intro">Based on your answers. <button class="linkbtn" type="button" data-wizard>Change answers</button></p></div></div>
    <div class="grid">${picks.map((it,i) => card(it,i)).join("")}</div></section>` : ""}

  ${favItems.length ? `<section aria-labelledby="h-fav"><div class="sec-head"><div><h2 id="h-fav">Your favorites</h2><p class="intro">Pinned with the star.</p></div></div>
    <div class="grid">${favItems.map((it,i) => card(it,i)).join("")}</div></section>` : ""}

  <section aria-labelledby="h-start"><div class="sec-head"><div><h2 id="h-start">${profile?.status === "returning" ? "Handy how-tos" : "Start here"}</h2><p class="intro">Short step-by-step guides. Tap one to open it.</p></div><button class="linkbtn" type="button" data-tab="guides">All guides →</button></div>
    <div class="grid">${startGuides.map((id,i) => guideCard(id,i)).join("")}</div></section>

  ${picks.length ? "" : `<section aria-labelledby="h-most"><div class="sec-head"><div><h2 id="h-most">Most used</h2><p class="intro">What students open every week.</p></div></div>
    <div class="grid">${most.map((it,i) => card(it,i)).join("")}</div></section>`}

  ${viewWeek()}

  <section class="dash2" aria-label="Rec center and sections">
    <div class="tile reveal">
      <span class="eyebrow">O'Connor Rec Center</span>
      <table class="hours">${D.recHours.map((h,i) => `<tr class="${i===today?"today":""}"><td>${DAY[i]}${i===today?" · today":""}</td><td>${h}</td></tr>`).join("")}</table>
      <a class="note" href="https://studentaffairs.jhu.edu/recreation/ralph-s-oconnor-recreation-center/hours-of-operation" target="_blank" rel="noopener">Posted hours. Check today's official hours ↗</a>
    </div>
    <div>
      <div class="sec-head"><div><h2>Explore</h2><p class="intro">Every section, one tap away.</p></div></div>
      <div class="grid explore">${D.sections.map((s,i) => {
        const count = s.id === "map" ? D.buildings.length : D.items.filter(x => x.cat === s.id).length;
        return `<button class="card ecard reveal" style="--i:${i}" type="button" data-tab="${s.id}">
          <span class="badge b-${s.id}">${s.id==="map" ? "MAP" : svg(s.id)}</span>
          <div class="card-body"><h3 class="t">${esc(s.label)}</h3><p class="d">${count} ${s.id==="map"?"buildings":"links"}</p></div></button>`;
      }).join("")}</div>
    </div>
  </section>`;
}

function viewWeek(){
  const today = new Date().getDay(), hasEx = classes.some(c => c.ex);
  return `
  <section id="week" aria-labelledby="h-week">
    <div class="sec-head">
      <div><h2 id="h-week">My week</h2><p class="intro">${hasEx ? "These two are examples. Add your first class and they disappear. " : ""}Saved only on this device.</p></div>
      <button class="btn sec" type="button" id="icsBtn">${svg("open",'width="16" height="16"')}Add to my calendar</button>
    </div>
    <div class="planner">
      ${classForm("c")}
      <div class="week">${[1,2,3,4,5].map(d => {
        const list = classes.filter(c => c.days.includes(d)).sort((a,b) => mins(a.start) - mins(b.start));
        return `<div class="day${d===today?" is-today":""}${list.length?"":" empty"}"><h4>${DAY[d].slice(0,3)}${d===today?" · today":""}</h4>${list.length ? list.map(c => `
          <div class="cls${c.ex?" example":""}"><b>${esc(c.name)}</b><span class="tm">${fmt(c.start)}–${fmt(c.end)}</span><span>${esc(c.bldg)}${c.room?" "+esc(c.room):""}</span>
          <span class="acts"><a href="${MAPS(c.bldg)}" target="_blank" rel="noopener">Map</a><button type="button" data-del="${c.id}">Remove</button></span></div>`).join("") : `<span class="note">Free</span>`}</div>`;
      }).join("")}</div>
    </div>
  </section>`;
}
function classForm(px, compact = false){
  return `<form class="addc ${compact ? "" : "tile"}" data-classform="${px}">
    <label for="${px}-name">Course name<input id="${px}-name" required placeholder="e.g. Machine Learning" maxlength="60"></label>
    <div><span class="lbl">Days</span><div class="days" role="group" aria-label="Days">${["Mon","Tue","Wed","Thu","Fri"].map((d,i)=>`<label><input type="checkbox" id="${px}-d${i+1}" value="${i+1}"><span>${d}</span></label>`).join("")}</div></div>
    <div class="row2"><label for="${px}-start">Starts<input id="${px}-start" type="time" required value="09:00"></label><label for="${px}-end">Ends<input id="${px}-end" type="time" required value="10:15"></label></div>
    <div class="row2">
      <label for="${px}-bldg">Building<select id="${px}-bldg">${D.buildings.map(([b])=>`<option>${esc(b)}</option>`).join("")}</select></label>
      <label for="${px}-room">Room<input id="${px}-room" placeholder="e.g. 228" maxlength="12"></label>
    </div>
    ${compact ? "" : `<label for="${px}-until">Last day of classes<input id="${px}-until" type="date" value="${esc(store.get("bjb-until","2026-12-11"))}"></label>`}
    <button class="btn" type="submit">Add class</button>
    <span class="note msg" role="status"></span>
  </form>`;
}

function viewGuides(words){
  const groups = [["start","New here? Start with these"],["everyday","Everyday how-tos"],["health","Health and safety"]];
  return `<section><div class="sec-head"><div><h2>Guides</h2><p class="intro">Step-by-step help for the things every Hopkins student has to figure out, with app download links.</p></div></div></section>
  ${groups.map(([g,label]) => `<section><h3 class="subhead">${label}</h3><div class="grid">${Object.keys(G).filter(id => G[id].group === g).map((id,i) => guideCard(id,i)).join("")}</div></section>`).join("")}`;
}

function viewSection(id){
  const s = D.sections.find(x => x.id === id);
  const body = id === "map" ? D.buildings.map((b,i) => bCard(b,i)).join("") : D.items.filter(i => i.cat === id).map((it,i) => card(it,i)).join("");
  const related = id === "map" ? [] : [...new Set(D.items.filter(i => i.cat === id && i.g).map(i => i.g))];
  return `<section aria-labelledby="h-sec"><div class="sec-head"><div><h2 id="h-sec">${esc(s.label)}</h2><p class="intro">${esc(s.intro)}</p></div></div><div class="grid">${body}</div></section>
  ${related.length ? `<section><h3 class="subhead">How-to guides for ${esc(s.label.toLowerCase())}</h3><div class="grid">${related.map((g,i) => guideCard(g,i)).join("")}</div></section>` : ""}`;
}

function viewSearch(q){
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hit = h => words.every(w => h.includes(w));
  const score = (title, h) => hit(h) ? words.reduce((s,w) => s + (title.toLowerCase().includes(w) ? 3 : 1), 0) : -1;
  const items = D.items.map(it => [it, score(it.t, (it.t+" "+it.d+" "+(it.k||"")+" "+it.cat).toLowerCase())]).filter(x => x[1] >= 0).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const guides = Object.keys(G).map(id => [id, score(G[id].title, (G[id].title+" "+G[id].who+" "+strip(G[id].steps.join(" "))+" "+(G[id].apps||[]).map(a=>a.name).join(" ")).toLowerCase())]).filter(x => x[1] >= 0).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const blds = D.buildings.filter(b => hit((b[0]+" "+b[1]).toLowerCase()));
  const total = items.length + guides.length + blds.length;
  if (!total) return `<div class="empty">Nothing matches "${esc(q)}". Try a simpler word like "shuttle", "food", "ID", "print" or a building name.</div>`;
  return `<section><div class="sec-head"><div><h2>Results for "${esc(q)}"</h2><p class="intro">${total} found. Press Esc to clear.</p></div></div>
    ${guides.length ? `<h3 class="subhead">Guides</h3><div class="grid">${guides.slice(0,6).map((g,i) => guideCard(g,i,words)).join("")}</div>` : ""}
    ${items.length ? `<h3 class="subhead">Places and links</h3><div class="grid">${items.map((it,i) => card(it,i,words)).join("")}</div>` : ""}
    ${blds.length ? `<h3 class="subhead">Buildings</h3><div class="grid">${blds.map((b,i) => bCard(b,i,words)).join("")}</div>` : ""}</section>`;
}

/* ================= render ================= */
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
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2000); }
async function copy(text){ try { await navigator.clipboard.writeText(text); toast("Copied " + text); } catch { toast(text); } }

/* ================= sheet (popup) ================= */
const sheet = $("#sheet"), sheetBody = $("#sheetBody");
let lastFocus = null;
function openSheet(html, cls = ""){
  lastFocus = document.activeElement;
  sheetBody.innerHTML = html;
  sheet.className = "sheet " + cls;
  if (!sheet.open) sheet.showModal();
  sheetBody.scrollTop = 0;
  const f = sheetBody.querySelector("[autofocus], .primary, button, a, input"); if (f) f.focus({preventScroll:true});
}
function closeSheet(){
  if (!sheet.open) return;
  sheet.classList.add("closing");
  setTimeout(() => { sheet.close(); sheet.classList.remove("closing"); if (lastFocus) lastFocus.focus?.({preventScroll:true}); }, reduced() ? 0 : 180);
}
sheet.addEventListener("click", e => { if (e.target === sheet) closeSheet(); });
sheet.addEventListener("cancel", e => { e.preventDefault(); closeSheet(); });

function callSheet(label, num){
  openSheet(`
    <div class="call-sheet">
      <span class="call-ic ${/emergenc/i.test(label) ? "red" : ""}">${svg("phone")}</span>
      <p class="eyebrow">Confirm call</p>
      <h2>${esc(label)}</h2>
      <p class="num">${esc(num)}</p>
      <p class="note">Tap <b>Call now</b> to place the call. On a laptop, dial this number on your phone.</p>
      <div class="sheet-actions">
        <a class="btn primary ${/emergenc/i.test(label) ? "danger" : ""}" href="${telOf(num)}" data-confirmed="1">${svg("phone",'width="18" height="18"')}Call now</a>
        <button class="btn sec" type="button" data-copy="${esc(num)}">${svg("copy",'width="18" height="18"')}Copy number</button>
        <button class="btn ghost" type="button" data-close>Cancel</button>
      </div>
    </div>`, "small");
}

function guideSheet(id){
  const g = G[id]; if (!g) return;
  openSheet(`
    <div class="g-head">
      <span class="badge b-guide big">${svg("guide")}</span>
      <div><p class="eyebrow">Guide · ${esc(g.time)}</p><h2 id="sheetTitle">${esc(g.title)}</h2><p class="note">For: ${esc(g.who)}</p></div>
    </div>
    ${g.apps ? `<div class="apps">${g.apps.map(a => `<div class="app"><span class="app-name">Get the <b>${esc(a.name)}</b> app</span><div class="stores">
        <a class="store" href="${esc(a.ios)}" target="_blank" rel="noopener">${svg("apple")}<span><small>Download on the</small>App Store</span></a>
        <a class="store" href="${esc(a.android)}" target="_blank" rel="noopener">${svg("play")}<span><small>Get it on</small>Google Play</span></a></div></div>`).join("")}</div>` : ""}
    <ol class="steps">${g.steps.map(s => `<li>${s}</li>`).join("")}</ol>
    ${g.tips ? `<div class="tips"><p class="eyebrow">Good to know</p><ul>${g.tips.map(t => `<li>${t}</li>`).join("")}</ul></div>` : ""}
    ${g.phones ? `<div class="g-phones">${g.phones.map(p => `<span class="phone"><b>${esc(p.t)}</b> ${esc(p.p)}<a class="mini call" href="${telOf(p.p)}" data-label="${esc(p.t)}" data-num="${esc(p.p)}">${svg("phone")}Call</a></span>`).join("")}</div>` : ""}
    <div class="sheet-actions">
      ${g.link ? `<a class="btn primary" href="${esc(g.link.u)}" target="_blank" rel="noopener">${svg("open",'width="18" height="18"')}${esc(g.link.t)}</a>` : ""}
      ${Object.values(CHECK).some(c => c.g === id) && profile ? (() => { const cid = Object.keys(CHECK).find(k => CHECK[k].g === id); return checklistIds(profile).includes(cid) ? `<button class="btn sec" type="button" data-tick="${cid}" data-close-after>${doneSet.has(cid) ? "Done ✓" : "Mark as done"}</button>` : ""; })() : ""}
      <button class="btn ghost" type="button" data-close>Close</button>
    </div>`);
}

/* ================= setup wizard ================= */
let draft = null, step = 0;
const STEPS = ["About you","Your program","Getting around","Your classes","Interests"];
function chip(name, value, label, type = "radio", checked = false){
  return `<label class="opt"><input type="${type}" name="${name}" value="${value}" ${checked ? "checked" : ""}><span>${label}</span></label>`;
}
function wizStepHTML(){
  const p = draft;
  const has = (k, v) => Array.isArray(p[k]) ? p[k].includes(v) : p[k] === v;
  let body = "";
  if (step === 0) body = `
    <label class="field" for="w-name">What should we call you? <span class="opt-tag">Optional</span><input id="w-name" value="${esc(p.name||"")}" placeholder="First name" maxlength="30" autocomplete="given-name"></label>
    <fieldset><legend>Are you new to Hopkins?</legend><div class="opts">
      ${chip("status","new","I'm new this year","radio",has("status","new"))}${chip("status","returning","I've been here before","radio",has("status","returning"))}</div></fieldset>`;
  if (step === 1) body = `
    <fieldset><legend>Your program</legend><div class="opts">
      ${chip("level","undergrad","Undergraduate","radio",has("level","undergrad"))}${chip("level","masters","Master's","radio",has("level","masters"))}${chip("level","phd","PhD","radio",has("level","phd"))}${chip("level","other","Other","radio",has("level","other"))}</div></fieldset>
    <fieldset><legend>Your school</legend><div class="opts">
      ${chip("school","wse","Engineering (Whiting)","radio",has("school","wse"))}${chip("school","ksas","Arts & Sciences (Krieger)","radio",has("school","ksas"))}${chip("school","other","Another school","radio",has("school","other"))}</div></fieldset>
    <fieldset><legend>Are you an international student (F-1 or J-1)?</legend><div class="opts">
      ${chip("intl","yes","Yes","radio",p.intl === true)}${chip("intl","no","No","radio",p.intl === false)}</div></fieldset>`;
  if (step === 2) body = `
    <fieldset><legend>Where do you live?</legend><div class="opts">
      ${chip("live","oncampus","On-campus housing","radio",has("live","oncampus"))}${chip("live","nearby","Off campus, near Homewood","radio",has("live","nearby"))}${chip("live","commute","Farther away, I commute","radio",has("live","commute"))}</div></fieldset>
    <fieldset><legend>How do you get around? <span class="opt-tag">Pick any</span></legend><div class="opts">
      ${[["walk","Walk"],["shuttle","JHU shuttles"],["bus","City bus"],["bike","Bike or scooter"],["car","Car"]].map(([v,l]) => chip("travel",v,l,"checkbox",has("travel",v))).join("")}</div></fieldset>`;
  if (step === 3) body = `
    <p class="note">Add each class once. You will get an "up next" card, directions and a calendar file. You can skip this and add classes later.</p>
    <ul class="wiz-classes">${realClasses().map(c => `<li><b>${esc(c.name)}</b> · ${c.days.map(d=>DAY[d].slice(0,3)).join(", ")} · ${fmt(c.start)} · ${esc(c.bldg)} <button class="mini" type="button" data-del="${c.id}">Remove</button></li>`).join("") || `<li class="note">No classes yet.</li>`}</ul>
    ${classForm("wc", true)}`;
  if (step === 4) body = `
    <fieldset><legend>What are you into? <span class="opt-tag">Pick any</span></legend><div class="opts">
      ${[["fitness","Fitness & sports"],["clubs","Clubs & events"],["career","Jobs & internships"],["research","Research & study"],["arts","Arts & culture"],["explore","Exploring Baltimore"],["food","Good cheap food"],["wellbeing","Wellbeing"]].map(([v,l]) => chip("interests",v,l,"checkbox",has("interests",v))).join("")}</div></fieldset>
    <fieldset><legend>Food needs <span class="opt-tag">Optional</span></legend><div class="opts">
      ${[["vegetarian","Vegetarian"],["vegan","Vegan"],["halal","Halal"],["kosher","Kosher"]].map(([v,l]) => chip("diet",v,l,"checkbox",has("diet",v))).join("")}</div></fieldset>`;
  return `
    <div class="wiz">
      <div class="wiz-top">
        <p class="eyebrow">Make it mine · step ${step+1} of ${STEPS.length}</p>
        <button class="iconx" type="button" data-close aria-label="Close setup">${svg("close")}</button>
      </div>
      <div class="dots" aria-hidden="true">${STEPS.map((s,i) => `<span class="${i<=step?"on":""}"></span>`).join("")}</div>
      <h2 id="sheetTitle">${STEPS[step]}</h2>
      <div id="wizForm" class="wiz-body">${body}</div>
      <div class="sheet-actions wiz-nav">
        ${step > 0 ? `<button class="btn ghost" type="button" data-wiz="back">Back</button>` : `<span></span>`}
        <button class="btn primary" type="button" data-wiz="next">${step === STEPS.length - 1 ? `${svg("check",'width="18" height="18"')}Build my plan` : "Next"}</button>
      </div>
    </div>`;
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
    profile = Object.assign({}, draft, {done:true}); store.set("bjb-profile", profile);
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
  const first = days => { const d = new Date(); for (let i=0;i<7;i++){ const x = new Date(d); x.setDate(d.getDate()+i); if (days.includes(x.getDay())) return x; } return d; };
  const L = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Blue Jay Buddy//EN","CALSCALE:GREGORIAN",
    "BEGIN:VTIMEZONE","TZID:America/New_York","BEGIN:DAYLIGHT","TZOFFSETFROM:-0500","TZOFFSETTO:-0400","TZNAME:EDT","DTSTART:19700308T020000","RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU","END:DAYLIGHT",
    "BEGIN:STANDARD","TZOFFSETFROM:-0400","TZOFFSETTO:-0500","TZNAME:EST","DTSTART:19701101T020000","RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU","END:STANDARD","END:VTIMEZONE"];
  real.forEach(c => {
    const f = first(c.days), ymd = `${f.getFullYear()}${pad(f.getMonth()+1)}${pad(f.getDate())}`;
    L.push("BEGIN:VEVENT",`UID:bjb-${c.id}@bluejaybuddy`,`DTSTAMP:${stamp}`,`DTSTART;TZID=America/New_York:${ymd}T${c.start.replace(":","")}00`,
      `DTEND;TZID=America/New_York:${ymd}T${c.end.replace(":","")}00`,`RRULE:FREQ=WEEKLY;BYDAY=${c.days.map(d=>BY[d]).join(",")};UNTIL=${until}T235959Z`,
      `SUMMARY:${c.name.replace(/[,;\\]/g," ")}`,`LOCATION:${(c.bldg+(c.room?" "+c.room:"")).replace(/[,;\\]/g," ")}`,"END:VEVENT");
  });
  L.push("END:VCALENDAR");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([L.join("\r\n")], {type:"text/calendar"})); a.download = "my-jhu-classes.ics";
  document.body.appendChild(a); a.click(); a.remove();
  openSheet(`<div class="call-sheet"><span class="call-ic">${svg("check")}</span><h2>Calendar file downloaded</h2>
    <ol class="steps left"><li><b>iPhone or Mac:</b> open the file and tap <b>Add All</b>.</li><li><b>Google Calendar:</b> on a computer, go to Settings → Import &amp; export → Import, and choose the file.</li><li><b>Outlook:</b> open the file, or use Add calendar → Upload from file.</li></ol>
    <div class="sheet-actions"><button class="btn primary" type="button" data-close>Got it</button></div></div>`, "small");
}

/* ================= events ================= */
// Calls always ask first: the first tap opens a confirm popup, "Call now" inside it dials.
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="tel:"]');
  if (a && !a.dataset.confirmed){
    e.preventDefault();
    const label = a.dataset.label || a.textContent.trim() || "this number";
    const num = a.dataset.num || a.getAttribute("href").slice(4).replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    callSheet(label, num);
  } else if (a && a.dataset.confirmed){ setTimeout(closeSheet, 400); }
}, true);

document.addEventListener("click", e => {
  const T = sel => e.target.closest(sel);
  let el;
  if ((el = T("[data-close]"))){ closeSheet(); return; }
  if ((el = T("[data-wizard]"))){ openWizard(); return; }
  if ((el = T("[data-wiz]"))){ wizGo(el.dataset.wiz); return; }
  if ((el = T("[data-guide]"))){ guideSheet(el.dataset.guide); return; }
  if ((el = T("[data-tab]"))){ go(el.dataset.tab); return; }
  if ((el = T("[data-go]"))){
    const w = el.dataset.go;
    if (sheet.open) closeSheet();
    if (w === "week"){ if (tab !== "home" || $("#q").value) go("home", false); setTimeout(() => $("#week")?.scrollIntoView({behavior: reduced() ? "auto" : "smooth"}), 60); }
    else if (w === "plan"){ openWizard(); }
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
    if (!classes.length) classes = [];
    saveClasses(); toast("Class removed");
    if (sheet.open && sheet.classList.contains("wizard")){ sheetBody.innerHTML = wizStepHTML(); } else { render(true); }
    return;
  }
  if (T("#icsBtn")) exportICS();
});

document.addEventListener("submit", e => {
  const f = e.target.closest("[data-classform]"); if (!f) return;
  e.preventDefault();
  const px = f.dataset.classform, g = id => document.getElementById(`${px}-${id}`), msg = f.querySelector(".msg");
  const days = [1,2,3,4,5].filter(d => g("d"+d).checked);
  if (!days.length){ msg.textContent = "Pick at least one day."; return; }
  if (mins(g("end").value) <= mins(g("start").value)){ msg.textContent = "The end time must be after the start time."; return; }
  if (g("until")) store.set("bjb-until", g("until").value);
  classes = classes.filter(c => !c.ex);
  classes.push({id:Date.now(), name:g("name").value.trim(), days, start:g("start").value, end:g("end").value, bldg:g("bldg").value, room:g("room").value.trim()});
  saveClasses(); toast(`Added ${g("name").value.trim()}`);
  if (px === "wc"){ readWizStep(); sheetBody.innerHTML = wizStepHTML(); }
  else { render(true); $("#week")?.scrollIntoView(); }
});

$("#planBtn").addEventListener("click", openWizard);
let tmr;
$("#q").addEventListener("input", () => { clearTimeout(tmr); tmr = setTimeout(render, 110); });
$("#q").addEventListener("keydown", e => { if (e.key === "Escape"){ $("#q").value = ""; render(); $("#q").blur(); } });
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
      <img src="assets/icon.svg" alt="" width="72" height="72">
      <h2>Welcome to Blue Jay Buddy</h2>
      <p>Shuttles, food, buildings, safety numbers and step-by-step guides for Hopkins Homewood, all in one place. No login.</p>
      <div class="sheet-actions"><button class="btn primary" type="button" data-wizard>${svg("sparkle",'width="18" height="18"')}Make it mine (1 min)</button>
      <button class="btn ghost" type="button" data-close>Just look around</button></div></div>`, "small");
  }, 900);
}
setInterval(() => { if (tab === "home" && !$("#q").value && !sheet.open && !document.activeElement.closest?.("form")) render(true); }, 60000);
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();

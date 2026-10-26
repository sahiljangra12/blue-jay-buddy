(() => {
"use strict";
const D = window.BJB, MAPS = D.maps;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const DAY = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

/* ---------- storage (browser only, never leaves the device) ---------- */
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ---------- icons ---------- */
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
};
const svg = (name, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${ICON[name]}</svg>`;
const initials = n => n.replace(/^(Ralph S\.|Milton S\.)\s*/,"").split(/\s+/).filter(w=>/^[A-Z]/.test(w)).slice(0,2).map(w=>w[0]).join("");

/* ---------- state ---------- */
let favs = new Set(store.get("bjb-favs", []));
let classes = store.get("bjb-classes", null);
const usingExample = classes === null;
if (usingExample) classes = [
  {id:1,name:"Data Structures",days:[1,3],start:"10:30",end:"11:45",bldg:"Malone Hall",room:"228",ex:true},
  {id:2,name:"Applied Statistics",days:[2,4],start:"13:30",end:"14:45",bldg:"Hodson Hall",room:"110",ex:true},
];
const validTabs = ["home", ...D.sections.map(s => s.id)];
let tab = validTabs.includes(location.hash.slice(1)) ? location.hash.slice(1) : "home";

/* ---------- theme + sky ---------- */
function applyTheme(t){
  if (t) document.documentElement.setAttribute("data-theme", t);
  else document.documentElement.removeAttribute("data-theme");
}
applyTheme(store.get("bjb-theme", null));
$("#themeBtn").addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark" ||
    (!document.documentElement.hasAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  const next = dark ? "light" : "dark";
  applyTheme(next); store.set("bjb-theme", next);
  toast(next === "dark" ? "Dark mode on" : "Light mode on");
});
function setSky(){
  const h = new Date().getHours();
  const sky = h >= 5 && h < 8 ? "dawn" : h >= 8 && h < 17 ? "day" : h >= 17 && h < 20 ? "dusk" : "night";
  document.body.dataset.sky = sky;
  const g = h < 5 ? "Up late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good night";
  $("#greet").textContent = `${g}, Blue Jay · ${new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}`;
}

/* ---------- quick actions ---------- */
const QUICK = [
  {t:"Emergency", u:"tel:4105167777", i:"phone", cls:"sos"},
  {t:"Safety escort", u:"tel:4105164600", i:"walk"},
  {t:"Shuttles", u:"https://jhfre.jhu.edu/ts/transportation/shuttle-services", i:"move"},
  {t:"Food hours", u:"https://studentaffairs.jhu.edu/dining/where-to-eat/", i:"food"},
  {t:"Canvas", u:"https://canvas.jhu.edu", i:"academics"},
  {t:"SIS", u:"https://sis.jhu.edu", i:"services"},
  {t:"Library", u:"https://www.library.jhu.edu", i:"book"},
  {t:"Clubs & events", u:"https://jhu.campusgroups.com", i:"fun"},
];
$("#quick").innerHTML = QUICK.map(q =>
  `<a class="qa ${q.cls||""}" href="${q.u}" ${q.u.startsWith("http")?'target="_blank" rel="noopener"':""}><span class="ic">${svg(q.i)}</span>${esc(q.t)}</a>`).join("");

/* ---------- helpers ---------- */
const fmt = hm => { const [h,m] = hm.split(":").map(Number); return ((h+11)%12+1) + ":" + String(m).padStart(2,"0") + (h>=12?" PM":" AM"); };
const mins = hm => { const [h,m] = hm.split(":").map(Number); return h*60+m; };
const idOf = it => it.t;
const highlight = (text, words) => {
  let out = esc(text);
  words.forEach(w => { if (w.length > 1) out = out.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`,"ig"), "<mark>$1</mark>"); });
  return out;
};

function card(it, i = 0, words = []){
  const fav = favs.has(idOf(it));
  const phone = it.p ? `<span class="phone"><a href="tel:${it.p.replace(/\D/g,"")}">${esc(it.p)}</a><button class="copy" type="button" data-copy="${esc(it.p)}">Copy</button></span>` : "";
  return `<div class="card reveal" style="--i:${i}">
    <span class="badge b-${it.cat}">${svg(it.cat)}</span>
    <div class="card-body">
      <a class="t" href="${esc(it.u)}" target="_blank" rel="noopener" style="text-decoration:none">${highlight(it.t, words)} <span aria-hidden="true" style="color:var(--sky)">↗</span></a>
      <span class="d">${highlight(it.d, words)}</span>
      ${phone ? `<span class="meta">${phone}</span>` : ""}
    </div>
    <button class="star" type="button" data-fav="${esc(idOf(it))}" aria-pressed="${fav}" aria-label="${fav?"Remove from":"Add to"} favorites: ${esc(it.t)}">${svg("star")}</button>
  </div>`;
}
function bCard([n, type], i = 0, words = []){
  return `<a class="card reveal" style="--i:${i}" href="${MAPS(n)}" target="_blank" rel="noopener">
    <span class="badge b-map">${esc(initials(n))}</span>
    <div class="card-body"><span class="t">${highlight(n, words)}</span><span class="meta"><span class="chip">${esc(type)}</span><span class="note">Directions ↗</span></span></div>
  </a>`;
}

/* ---------- next class ---------- */
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
      return {c, when, startsIn, live};
    }
  }
  return null;
}
function countdown(n){
  if (!n || n.startsIn === null) return "";
  const h = Math.floor(n.startsIn/60), mm = n.startsIn % 60;
  return `<span class="count">starts in ${h ? h+"h " : ""}${mm}m${n.startsIn <= 15 ? " · time to walk" : ""}</span>`;
}

/* ---------- views ---------- */
function viewHome(){
  const n = nextClass(), today = new Date().getDay();
  const nextTile = n ? `
      <span class="eyebrow">Up next${n.c.ex ? " · example class" : ""}</span>
      <span class="big">${esc(n.c.name)}</span>
      <span class="sub">${esc(n.when)} · ${esc(n.c.bldg)}${n.c.room ? ", room "+esc(n.c.room) : ""}</span>
      ${countdown(n)}
      <div class="row"><a class="btn-w" href="${MAPS(n.c.bldg)}" target="_blank" rel="noopener">${svg("walk",'width="16" height="16"')}Walk there</a><button class="btn-w ghost" type="button" data-scroll="week">Edit my week</button></div>`
    : `<span class="eyebrow">Up next</span><span class="big">No classes this week</span><span class="sub">Add your timetable below to see what's next.</span>
       <div class="row"><button class="btn-w" type="button" data-scroll="week">Add a class</button></div>`;
  const recRows = D.recHours.map((h,i) => `<tr class="${i===today?"today":""}"><td>${DAY[i]}${i===today?" · today":""}</td><td>${h}</td></tr>`).join("");
  const favItems = D.items.filter(it => favs.has(idOf(it)));
  const most = D.mostUsed.map(t => D.items.find(i => i.t === t)).filter(Boolean);

  return `
  <section class="dash" aria-label="Today">
    <div class="tile next reveal">
      <img class="deco" src="assets/icon.svg" alt="">
      ${nextTile}
    </div>
    <div class="tile reveal" style="--i:1">
      <span class="eyebrow">O'Connor Rec Center</span>
      <table class="hours">${recRows}</table>
      <a class="note" href="https://studentaffairs.jhu.edu/recreation/ralph-s-oconnor-recreation-center/hours-of-operation" target="_blank" rel="noopener">Posted hours. Check today's official hours ↗</a>
    </div>
  </section>

  <section aria-labelledby="h-fav">
    <div class="sec-head"><div><h2 id="h-fav">Your favorites</h2><p class="intro">${favItems.length ? "Pinned with the star. They stay on this device." : "Tap the star on any card to pin it here."}</p></div></div>
    ${favItems.length ? `<div class="grid">${favItems.map((it,i) => card(it,i)).join("")}</div>` : `<div class="empty">No favorites yet. Try starring SIS or the JHMI shuttle.</div>`}
  </section>

  <section aria-labelledby="h-most">
    <div class="sec-head"><div><h2 id="h-most">Most used</h2><p class="intro">The places students open every week.</p></div></div>
    <div class="grid">${most.map((it,i) => card(it,i)).join("")}</div>
  </section>

  ${viewWeek()}

  <section aria-labelledby="h-explore">
    <div class="sec-head"><div><h2 id="h-explore">Explore</h2><p class="intro">Every section, one tap away.</p></div></div>
    <div class="grid">${D.sections.map((s,i) => {
      const count = s.id === "map" ? D.buildings.length : D.items.filter(x => x.cat === s.id).length;
      return `<button class="card reveal" style="--i:${i};text-align:left;font:inherit;color:inherit;cursor:pointer" type="button" data-tab="${s.id}">
        <span class="badge b-${s.id}">${s.id==="map" ? "MAP" : svg(s.id)}</span>
        <div class="card-body"><span class="t">${esc(s.label)}</span><span class="d">${count} ${s.id==="map"?"buildings":"links"}</span></div></button>`;
    }).join("")}</div>
  </section>`;
}

function viewWeek(){
  const today = new Date().getDay();
  return `
  <section id="week" aria-labelledby="h-week">
    <div class="sec-head">
      <div><h2 id="h-week">My week</h2><p class="intro">${usingExample ? "The two classes shown are examples. Add your own and they disappear. " : ""}Saved only on this device. Nothing is sent anywhere.</p></div>
      <button class="btn sec" type="button" id="icsBtn">Add to my calendar (.ics)</button>
    </div>
    <div class="planner">
      <form class="addc tile" id="addc">
        <label for="c-name">Course name<input id="c-name" required placeholder="e.g. Machine Learning" maxlength="60"></label>
        <div><span class="note">Days</span><div class="days" role="group" aria-label="Days">${["Mon","Tue","Wed","Thu","Fri"].map((d,i)=>`<label><input type="checkbox" id="c-d${i+1}" value="${i+1}"><span>${d}</span></label>`).join("")}</div></div>
        <div class="row2"><label for="c-start">Starts<input id="c-start" type="time" required value="09:00"></label><label for="c-end">Ends<input id="c-end" type="time" required value="10:15"></label></div>
        <div class="row2">
          <label for="c-bldg">Building<select id="c-bldg">${D.buildings.map(([b])=>`<option>${esc(b)}</option>`).join("")}</select></label>
          <label for="c-room">Room<input id="c-room" placeholder="e.g. 228" maxlength="12"></label>
        </div>
        <label for="c-until">Classes end on<input id="c-until" type="date" value="${store.get("bjb-until","2026-12-11")}"></label>
        <button class="btn" type="submit">Add class</button>
        <span class="note" id="c-msg" role="status"></span>
      </form>
      <div class="week">${[1,2,3,4,5].map(d => {
        const list = classes.filter(c => c.days.includes(d)).sort((a,b) => mins(a.start) - mins(b.start));
        return `<div class="day${d===today?" is-today":""}"><h4>${DAY[d].slice(0,3)}${d===today?" · today":""}</h4>${list.length ? list.map(c => `
          <div class="cls${c.ex?" example":""}"><b>${esc(c.name)}</b><span class="tm">${fmt(c.start)}–${fmt(c.end)}</span><span>${esc(c.bldg)}${c.room?" "+esc(c.room):""}</span>
          <span class="acts"><a href="${MAPS(c.bldg)}" target="_blank" rel="noopener">Map</a><button type="button" data-del="${c.id}">Remove</button></span></div>`).join("") : `<span class="note">Free</span>`}</div>`;
      }).join("")}</div>
    </div>
  </section>`;
}

function viewSection(id){
  const s = D.sections.find(x => x.id === id);
  const body = id === "map"
    ? D.buildings.map((b,i) => bCard(b,i)).join("")
    : D.items.filter(i => i.cat === id).map((it,i) => card(it,i)).join("");
  return `<section aria-labelledby="h-sec"><div class="sec-head"><div><h2 id="h-sec">${esc(s.label)}</h2><p class="intro">${esc(s.intro)}</p></div></div><div class="grid">${body}</div></section>`;
}

function viewSearch(q){
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = it => (it.t+" "+it.d+" "+(it.k||"")+" "+it.cat).toLowerCase();
  const score = it => { const h = hay(it); if (!words.every(w => h.includes(w))) return -1; return words.reduce((s,w) => s + (it.t.toLowerCase().includes(w) ? 3 : 1), 0); };
  const items = D.items.map(it => [it, score(it)]).filter(x => x[1] >= 0).sort((a,b) => b[1]-a[1]).map(x => x[0]);
  const blds = D.buildings.filter(b => words.every(w => (b[0]+" "+b[1]).toLowerCase().includes(w)));
  if (!items.length && !blds.length)
    return `<div class="empty">Nothing matches "${esc(q)}". Try a simpler word like "shuttle", "food", "ID" or a building name.</div>`;
  return `<section><div class="sec-head"><div><h2>Results for "${esc(q)}"</h2><p class="intro">${items.length + blds.length} found. Press Esc to clear.</p></div></div>
    <div class="grid">${items.map((it,i) => card(it,i,words)).join("")}${blds.map((b,i) => bCard(b,i+items.length,words)).join("")}</div></section>`;
}

/* ---------- render ---------- */
function renderTabs(q){
  $("#tabs").innerHTML = [["home","Home"], ...D.sections.map(s => [s.id, s.label])]
    .map(([id,l]) => `<button class="tab" role="tab" type="button" data-tab="${id}" aria-selected="${!q && id===tab}">${esc(l)}</button>`).join("");
  document.querySelectorAll(".bottombar button").forEach(b => b.classList.toggle("on", !q && b.dataset.go === tab));
  const sel = $(`.tab[aria-selected="true"]`); if (sel) sel.scrollIntoView({block:"nearest", inline:"center"});
}
function render(quiet = false){
  const q = $("#q").value.trim();
  $("#main").classList.toggle("calm", quiet);
  renderTabs(q);
  $("#main").innerHTML = q ? viewSearch(q) : tab === "home" ? viewHome() : viewSection(tab);
}
function go(t, scroll = true){
  tab = t; $("#q").value = "";
  history.replaceState(null, "", t === "home" ? location.pathname : "#" + t);
  render();
  if (scroll) $(".tabs").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
}

/* ---------- toast + copy ---------- */
let toastT;
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1800); }
async function copy(text){
  try { await navigator.clipboard.writeText(text); toast("Copied " + text); }
  catch { toast(text); }
}

/* ---------- calendar export ---------- */
function exportICS(){
  const real = classes.filter(c => !c.ex);
  if (!real.length){ toast("Add your own classes first"); return; }
  const until = ($("#c-until")?.value || "2026-12-11").replace(/-/g,"");
  const BY = ["SU","MO","TU","WE","TH","FR","SA"];
  const pad = n => String(n).padStart(2,"0");
  const stamp = new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"");
  const firstDate = days => { const d = new Date(); for (let i=0;i<7;i++){ const x = new Date(d); x.setDate(d.getDate()+i); if (days.includes(x.getDay())) return x; } return d; };
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Blue Jay Buddy//EN","CALSCALE:GREGORIAN",
    "BEGIN:VTIMEZONE","TZID:America/New_York",
    "BEGIN:DAYLIGHT","TZOFFSETFROM:-0500","TZOFFSETTO:-0400","TZNAME:EDT","DTSTART:19700308T020000","RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU","END:DAYLIGHT",
    "BEGIN:STANDARD","TZOFFSETFROM:-0400","TZOFFSETTO:-0500","TZNAME:EST","DTSTART:19701101T020000","RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU","END:STANDARD",
    "END:VTIMEZONE"];
  real.forEach(c => {
    const f = firstDate(c.days), ymd = `${f.getFullYear()}${pad(f.getMonth()+1)}${pad(f.getDate())}`;
    lines.push("BEGIN:VEVENT", `UID:bjb-${c.id}@bluejaybuddy`, `DTSTAMP:${stamp}`,
      `DTSTART;TZID=America/New_York:${ymd}T${c.start.replace(":","")}00`,
      `DTEND;TZID=America/New_York:${ymd}T${c.end.replace(":","")}00`,
      `RRULE:FREQ=WEEKLY;BYDAY=${c.days.map(d=>BY[d]).join(",")};UNTIL=${until}T235959Z`,
      `SUMMARY:${c.name.replace(/[,;]/g," ")}`, `LOCATION:${(c.bldg + (c.room?" "+c.room:"")).replace(/[,;]/g," ")}`, "END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], {type:"text/calendar"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "my-jhu-classes.ics";
  document.body.appendChild(a); a.click(); a.remove();
  toast("Calendar file downloaded. Open it to import.");
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("[data-tab]"); if (t){ go(t.dataset.tab); return; }
  const g = e.target.closest("[data-go]");
  if (g){
    const where = g.dataset.go;
    if (where === "search"){ window.scrollTo({top:0, behavior:"smooth"}); setTimeout(() => $("#q").focus(), 250); }
    else if (where === "week"){ if (tab !== "home") go("home", false); setTimeout(() => $("#week")?.scrollIntoView({behavior:"smooth"}), 30); }
    else go(where);
    return;
  }
  const sc = e.target.closest("[data-scroll]"); if (sc){ $("#"+sc.dataset.scroll)?.scrollIntoView({behavior:"smooth"}); return; }
  const c = e.target.closest("[data-copy]"); if (c){ e.preventDefault(); copy(c.dataset.copy); return; }
  const f = e.target.closest("[data-fav]");
  if (f){
    const id = f.dataset.fav, on = !favs.has(id);
    on ? favs.add(id) : favs.delete(id); store.set("bjb-favs", [...favs]);
    f.setAttribute("aria-pressed", on); f.classList.remove("pop"); void f.offsetWidth; f.classList.add("pop");
    toast(on ? "Added to favorites" : "Removed from favorites");
    if (tab === "home" && !$("#q").value) setTimeout(render, 250);
    return;
  }
  const del = e.target.closest("[data-del]");
  if (del){
    classes = classes.filter(x => String(x.id) !== del.dataset.del && !x.ex);
    store.set("bjb-classes", classes); toast("Class removed"); render(); $("#week")?.scrollIntoView();
    return;
  }
  if (e.target.closest("#icsBtn")) exportICS();
});

document.addEventListener("submit", e => {
  if (e.target.id !== "addc") return;
  e.preventDefault();
  const days = [1,2,3,4,5].filter(d => $("#c-d"+d).checked), msg = $("#c-msg");
  if (!days.length){ msg.textContent = "Pick at least one day."; return; }
  if (mins($("#c-end").value) <= mins($("#c-start").value)){ msg.textContent = "The end time must be after the start time."; return; }
  store.set("bjb-until", $("#c-until").value);
  classes = classes.filter(c => !c.ex);
  classes.push({id:Date.now(), name:$("#c-name").value.trim(), days, start:$("#c-start").value, end:$("#c-end").value, bldg:$("#c-bldg").value, room:$("#c-room").value.trim()});
  store.set("bjb-classes", classes);
  render(); $("#week")?.scrollIntoView(); toast("Class added");
});

let tmr;
$("#q").addEventListener("input", () => { clearTimeout(tmr); tmr = setTimeout(() => { render(); }, 110); });
$("#q").addEventListener("keydown", e => { if (e.key === "Escape"){ $("#q").value = ""; render(); $("#q").blur(); } });
document.addEventListener("keydown", e => {
  if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){ e.preventDefault(); window.scrollTo({top:0, behavior:"smooth"}); $("#q").focus(); }
});
window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (validTabs.includes(h) && h !== tab){ tab = h; render(); } });

/* ---------- boot ---------- */
setSky(); render();
setInterval(() => { setSky(); if (tab === "home" && !$("#q").value && !document.activeElement.closest?.("#addc")) render(true); }, 60000);
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();

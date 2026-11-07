// Campus tab: Get around · Groups · Gym & fun · Health · Services · Safety · Buildings · Guides
(() => {
"use strict";
const App = window.App, { esc, svg, DAY } = App, D = App.D, G = App.G;
const SUBS = [["move","Get around"],["groups","Groups"],["gym","Gym & fun"],["health","Health"],["services","Services"],["safety","Safety"],["buildings","Buildings"],["guides","Guides"]];

// One line of context per link: when would a student actually need it?
const WHEN = {
  "SIS":"registering, checking grades, paying your bill, holds", "Canvas":"homework, syllabi, lecture slides", "my.JH portal":"getting into any JHU app",
  "JHED login & MFA":"you're locked out or got a new phone", "Academic Support":"you need a tutor or study help", "Engineering Advising":"choosing courses, forms, degree questions (WSE)",
  "Arts & Sciences Advising":"choosing courses, majors, forms (KSAS)", "Sheridan Libraries":"books, articles, booking a study room", "Homewood Graduate Affairs":"grad funding, policies, grad events",
  "Academic calendar":"add/drop deadline, breaks, finals week",
  "J-Card Office":"lost your ID or need a new one", "IT Help Desk":"Wi-Fi or login isn't working", "Wi-Fi (eduroam)":"connecting a new laptop or phone", "Printing & scanning":"printing before class",
  "International Services (OIS)":"visa, I-20, travel signature, CPT/OPT", "Life Design Lab":"resume review, interview practice", "Handshake":"internships and on-campus jobs",
  "Student Disability Services":"exam accommodations", "Off-Campus Housing":"finding next year's apartment", "Lost and found":"you lost something on campus", "Dining Office":"meal plan or Dining Dollars questions",
  "Primary Care (doctor visits)":"you're sick, injured or need a vaccine", "Mental Health Services":"stress, anxiety, or you just need to talk to someone", "myHealth portal":"booking or cancelling an appointment",
  "Sexual Assault Helpline":"you or a friend need confidential support, any hour", "Student Outreach & Support":"life got complicated: money, family, housing, emergencies", "Student health insurance":"insurance card, claims, or waiving the plan",
  "The JHMI shuttle (\"the Jimmy\")":"going to Penn Station, Peabody or the medical campus", "Blue Jay Shuttle & Night Ride":"getting home safely after dark", "All shuttle routes":"any other shuttle", "Charm City Circulator":"free ride downtown or to the Inner Harbor",
  "Collegetown Shuttle":"Towson mall or Notre Dame of Maryland", "Parking permits":"you drive to campus",
  "Hopkins Groups":"finding clubs and this week's events", "O'Connor Rec Center":"gym, pool, climbing, intramurals", "Graduate Representative Organization":"meeting other grad students", "Baltimore Museum of Art":"a free afternoon next to campus", "Inner Harbor":"a weekend outing",
  "Campus emergency":"fire, medical or police emergency on campus", "Safety escort":"walking home late and want company", "LiveSafe app":"sharing your location or messaging security", "Weather & closures hotline":"snow day or closure?",
};
const items = cat => D.items.filter(i => i.cat === cat).map(i => Object.assign({ when: WHEN[i.t] }, i));
const list = cat => `<div class="list">${items(cat).map(it => App.itemCard(it)).join("")}</div>`;

App.recToday = () => {
  const d = new Date().getDay(), h = D.recHours[d];
  const m = h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/);
  if (!m) return { hours: h, open: null };
  const t = (H, M, ap) => ((+H % 12) + (ap === "PM" ? 12 : 0)) * 60 + +M;
  const now = new Date(), n = now.getHours() * 60 + now.getMinutes(), o = t(m[1], m[2], m[3]), c = t(m[4], m[5], m[6]);
  return { hours: h, open: n >= o && n < c, opensLater: n < o, closesIn: c - n };
};

App.views.campus = (sub, arg) => {
  sub = SUBS.some(s => s[0] === sub) ? sub : "move";
  const body = {
    move: () => `
      <div class="callout"><div><b>Live shuttle times</b><p>Every JHU shuttle shows up live in the TransLoc app. Night rides are requested there too.</p></div>
        <div class="row"><button class="btn primary" type="button" data-guide="transloc">${svg("bus")}Set up TransLoc</button><button class="btn soft" type="button" data-guide="bluejay">Night ride</button></div></div>
      ${list("move")}`,
    groups: () => App.groupsView(arg),
    gym: () => {
      const r = App.recToday();
      return `<div class="tile rec">
        <span class="eyebrow">${svg("dumbbell", 'width="14" height="14"')} O'Connor Rec Center · today</span>
        <b class="t2">${r.open ? "Open now" : r.opensLater ? "Opens later today" : "Closed now"} · ${esc(r.hours)}</b>
        <table class="hours">${D.recHours.map((h, i) => `<tr class="${i === new Date().getDay() ? "today" : ""}"><td>${DAY[i]}</td><td>${esc(h)}</td></tr>`).join("")}</table>
        <p class="note">Posted hours; holidays and breaks change them. <a href="https://studentaffairs.jhu.edu/recreation/ralph-s-oconnor-recreation-center/hours-of-operation" target="_blank" rel="noopener">Check today's official hours</a></p></div>
      ${list("fun")}`;
    },
    health: () => `<div class="callout warn"><div><b>In crisis or worried about someone?</b><p>Call or text 988 any time, or call Mental Health Services and choose the after-hours option.</p></div>
        <div class="row">${App.callBtn("988 Suicide & Crisis Lifeline", "988", "btn primary")}${App.callBtn("Mental Health Services", "410-516-3311", "btn soft")}</div></div>${list("health")}`,
    services: () => list("services") + `<h3 class="grp">Classes & academics</h3>` + list("academics"),
    safety: () => `<div class="callout danger"><div><b>Emergency on campus</b><p>Fire, medical or police. You can also dial 911.</p></div><div class="row">${App.callBtn("Campus emergency", "410-516-7777", "btn primary")}${App.callBtn("911", "911", "btn soft")}</div></div>${list("safety")}`,
    buildings: () => `<input class="filter" id="bFilter" placeholder="Find a building" aria-label="Find a building">
      <div class="bgrid" id="bGrid">${D.buildings.map(([n, t]) => `<a class="bcard" data-s="${esc((n + " " + t).toLowerCase())}" href="${App.walkTo(n + ", Johns Hopkins Homewood, Baltimore")}" target="_blank" rel="noopener">
        <div class="bimg">${window.BJB_ART?.building?.(n, t) || ""}</div><b>${esc(n)}</b><span>${esc(t)} · Directions ›</span></a>`).join("")}</div>`,
    guides: () => {
      const groups = [["start","Start here"],["everyday","Everyday"],["health","Health & safety"]];
      return groups.map(([g, l]) => { const gs = Object.entries(G).filter(([, x]) => (x.group || "everyday") === g); return gs.length ? `<h3 class="grp">${l}</h3><div class="list">${gs.map(([id, x]) => `<button class="item tap" type="button" data-guide="${id}"><div class="item-main"><h3>${esc(x.title)}</h3><p>${esc(x.who)} · ${esc(x.time)}${x.apps ? " · has an app" : ""}</p></div><span class="chev">›</span></button>`).join("")}</div>` : ""; }).join("");
    },
  }[sub]();
  return `<section class="page">${App.head("Campus")}${App.subnav("campus", SUBS, sub)}${body}</section>`;
};

document.addEventListener("input", e => {
  if (e.target.id === "bFilter"){ const q = e.target.value.toLowerCase(); App.$$("#bGrid .bcard").forEach(c => c.hidden = !c.dataset.s.includes(q)); }
});
})();

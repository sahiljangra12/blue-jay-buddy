// Blue Jay Buddy illustrations. Original animated artwork drawn in code (SVG), used instead of photos.
// Every scene shares the sky colours of the hero, so it follows the time of day (dawn, day, dusk, night).
// Animations pause when a picture is off screen and stop completely for people who prefer reduced motion.
(() => {
"use strict";
let uid = 0;
const id = p => `${p}${++uid}`;

/* ---------- small seeded random, so each building always looks the same ---------- */
const seedOf = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const rng = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

/* ---------- shared pieces ---------- */
const sky = g => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sky-top"/><stop offset="1" class="sky-bottom"/></linearGradient></defs>
  <rect width="400" height="250" fill="url(#${g})"/>
  <g class="stars"><circle cx="40" cy="30" r="1.4"/><circle cx="96" cy="58" r="1"/><circle cx="150" cy="22" r="1.2"/><circle cx="214" cy="46" r="1"/><circle cx="262" cy="18" r="1.4"/><circle cx="372" cy="70" r="1"/></g>`;
const sun = (x = 334, y = 48, r = 18) => `<circle class="sun" cx="${x}" cy="${y}" r="${r}"/>`;
const cloud = (y, s, dur, delay) => `<g class="i-cloud" style="--d:${dur}s;--dl:${delay}s"><g transform="translate(0 ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="34" ry="9"/><ellipse cx="14" cy="-7" rx="18" ry="10"/><ellipse cx="-12" cy="-4" rx="14" ry="8"/></g></g>`;
const tree = (x, y, r, shade = "") => `<g class="i-sway" style="transform-origin:${x}px ${y + r * 1.6}px;--d:${3 + (x % 3)}s"><rect class="trunk" x="${x - 3}" y="${y + r * .5}" width="6" height="${r * 1.1}"/><circle class="leaf ${shade}" cx="${x}" cy="${y}" r="${r}"/><circle class="leaf ${shade}" cx="${x - r * .6}" cy="${y + r * .4}" r="${r * .7}"/></g>`;
const ground = (y = 200, walk = "") => `<rect class="lawn" x="0" y="${y}" width="400" height="${250 - y}"/>${walk}`;
const person = (x, y, c, walkCls = "", d = 9) => `<g class="i-person ${walkCls}" style="--d:${d}s"><g transform="translate(${x} ${y})"><circle class="skin" cx="0" cy="-17" r="4"/><rect fill="${c}" x="-4" y="-13" width="8" height="10" rx="3"/><path class="legs" d="M-2 -3 L-3 4 M2 -3 L3 4"/></g></g>`;
const windows = (x, y, cols, rows, w, h, gx, gy, cls = "") => {
  let s = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
    s += `<rect x="${x + c * gx}" y="${y + r * gy}" width="${w}" height="${h}" rx="1" style="--k:${(r * cols + c) % 7}"/>`;
  return `<g class="i-win ${cls}">${s}</g>`;
};
const birds = () => `<g class="i-birds"><path d="M0 0 q5 -5 10 0 q5 -5 10 0"/><path d="M26 10 q4 -4 8 0 q4 -4 8 0"/></g>`;
const wrap = (label, body, cls = "") => `<svg class="ill ${cls}" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}"><title>${label}</title>${body}</svg>`;

/* ---------- the eight campus scenes ---------- */
const SCENES = {
  keyser: () => wrap("Illustration: students on Keyser Quad in front of a brick hall with a clock tower", `${sky(id("s"))}${sun()}
    ${cloud(40, 1, 46, -10)}${cloud(70, .7, 60, -40)}
    <rect class="brick" x="110" y="110" width="180" height="90"/><path class="roof" d="M104 112 L124 96 H276 L296 112Z"/>
    <rect class="stone" x="182" y="44" width="36" height="56"/><path class="dome" d="M180 46 Q200 18 220 46Z"/><circle class="clockface" cx="200" cy="66" r="9"/>
    <path class="i-hand" style="transform-origin:200px 66px" d="M200 66 V60"/>
    <path class="stone" d="M168 124 L200 104 L232 124Z"/>${windows(120, 126, 2, 2, 10, 16, 20, 30, "lit")}${windows(254, 126, 2, 2, 10, 16, 20, 30, "lit")}
    <g class="stone">${[176, 190, 204, 218].map(x => `<rect x="${x}" y="126" width="6" height="74"/>`).join("")}</g>
    ${ground(198)}<path class="walk" d="M186 198 H214 L250 250 H150Z"/>
    ${tree(60, 160, 28)}${tree(352, 158, 30, "b")}
    <ellipse class="blanket" cx="96" cy="222" rx="26" ry="7"/>
    ${person(86, 222, "#E8913A")}${person(108, 222, "#2F6FD0")}${person(300, 226, "#B83A4B")}${person(338, 222, "#3B8E5A")}
    <g class="i-frisbee"><ellipse cx="0" cy="0" rx="7" ry="2.4"/></g>`),

  brody: () => wrap("Illustration: a glass-walled learning commons with windows lighting up", `${sky(id("s"))}${sun(60, 46)}
    ${cloud(50, .9, 52, -20)}
    <rect class="glass" x="70" y="86" width="260" height="114" rx="4"/>
    <g class="mullion">${[0,1,2,3,4,5,6,7].map(i => `<path d="M${102 + i * 30} 86 V200"/>`).join("")}<path d="M70 124 H330 M70 162 H330"/></g>
    <g class="i-win glow">${[0,1,2].flatMap(r => [0,1,2,3,4,5,6,7,8].map(c => `<rect x="${76 + c * 28.6}" y="${92 + r * 38}" width="22" height="28" style="--k:${(r * 4 + c * 3) % 9}"/>`)).join("")}</g>
    <rect class="stone" x="62" y="80" width="276" height="8" rx="2"/>
    ${ground(198)}${tree(36, 166, 22)}${tree(368, 164, 24, "b")}
    ${person(150, 226, "#2F6FD0", "walk", 11)}${person(250, 228, "#E8913A", "walk2", 13)}`),

  mse: () => wrap("Illustration: a library mostly underground, with floors of bookshelves below the lawn", `${sky(id("s"))}${sun(330, 40, 14)}
    ${cloud(34, .8, 58, -30)}
    <rect class="brick" x="120" y="112" width="160" height="44"/><path class="roof" d="M114 114 L132 100 H268 L286 114Z"/>${windows(132, 122, 6, 1, 12, 20, 24, 0, "lit")}
    ${ground(156)}<rect class="soil" x="0" y="168" width="400" height="82"/>
    <rect class="cut" x="70" y="172" width="260" height="74" rx="6"/>
    ${[0,1].map(r => `<g class="shelf">${[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(i => `<rect x="${80 + i * 11}" y="${180 + r * 34}" width="8" height="${18 + (i * 7 % 6)}" class="bk${i % 4}"/>`).join("")}<rect class="plank" x="76" y="${200 + r * 34}" width="248" height="3"/></g>`).join("")}
    <g class="i-lamp"><circle cx="120" cy="176" r="3"/><circle cx="200" cy="176" r="3"/><circle cx="280" cy="176" r="3"/></g>
    <g class="i-book"><rect x="-8" y="-6" width="16" height="11" rx="1"/><path d="M0 -6 V5"/></g>
    ${tree(48, 128, 22)}${tree(356, 126, 24, "b")}`),

  decker: () => wrap("Illustration: modern engineering buildings with a turning gear and a blinking antenna", `${sky(id("s"))}${sun(60, 44, 16)}
    ${cloud(46, 1, 50, -5)}
    <rect class="stone2" x="40" y="96" width="140" height="104"/>${windows(50, 106, 5, 4, 18, 14, 25, 23, "lit")}
    <rect class="glass" x="190" y="70" width="170" height="130"/><g class="mullion"><path d="M232 70 V200 M274 70 V200 M316 70 V200 M190 112 H360 M190 156 H360"/></g>
    ${windows(196, 76, 4, 3, 30, 30, 42, 44, "glow")}
    <path class="mast" d="M330 70 V40"/><circle class="i-blink" cx="330" cy="38" r="3.5"/>
    <g class="i-gear" style="transform-origin:110px 76px"><circle class="gear" cx="110" cy="76" r="14"/>${[0,45,90,135,180,225,270,315].map(a => `<rect class="gear" x="106" y="56" width="8" height="8" transform="rotate(${a} 110 76)"/>`).join("")}<circle class="gearhole" cx="110" cy="76" r="5"/></g>
    ${ground(198)}${person(120, 226, "#3B8E5A", "walk", 12)}${person(270, 228, "#B83A4B", "walk2", 10)}`),

  gilman: () => wrap("Illustration: a brick hall with a white clock tower and birds flying past", `${sky(id("s"))}${sun(60, 50)}
    ${cloud(60, .9, 55, -25)}${birds()}
    <rect class="brick" x="80" y="120" width="240" height="80"/><path class="roof" d="M74 122 L96 104 H304 L326 122Z"/>
    <rect class="stone" x="176" y="34" width="48" height="74"/><rect class="stone" x="182" y="16" width="36" height="20"/><path class="dome" d="M180 18 Q200 -10 220 18Z"/>
    <circle class="clockface" cx="200" cy="64" r="13"/><path class="i-hand" style="transform-origin:200px 64px" d="M200 64 V55"/><path class="i-hand slow" style="transform-origin:200px 64px" d="M200 64 H206"/>
    ${windows(92, 132, 4, 2, 12, 20, 22, 32, "lit")}${windows(228, 132, 4, 2, 12, 20, 22, 32, "lit")}
    <path class="stone" d="M170 136 L200 116 L230 136Z"/><g class="stone">${[176,188,200,212,224].map(x => `<rect x="${x - 2}" y="136" width="5" height="64"/>`).join("")}</g>
    ${ground(198)}${tree(40, 164, 26)}${tree(362, 166, 26, "b")}`),

  shriver: () => wrap("Illustration: a concert hall with music notes floating out of the doors", `${sky(id("s"))}${sun(330, 46, 15)}
    ${cloud(44, .8, 48, -15)}
    <rect class="brick" x="90" y="100" width="220" height="100"/><path class="roof" d="M84 102 L110 82 H290 L316 102Z"/>
    <path class="stone" d="M150 118 L200 92 L250 118Z"/><g class="stone">${[156,172,188,204,220,236].map(x => `<rect x="${x}" y="118" width="7" height="82"/>`).join("")}</g>
    <rect class="door" x="184" y="160" width="32" height="40" rx="14"/>
    ${windows(100, 116, 2, 2, 12, 22, 22, 36, "lit")}${windows(266, 116, 2, 2, 12, 22, 22, 36, "lit")}
    ${["♪","♫","♪","♬"].map((n, i) => `<text class="i-note" style="--dl:${-i * 1.2}s;--x:${(i % 2 ? 1 : -1) * (14 + i * 6)}px" x="${196 + i * 3}" y="170">${n}</text>`).join("")}
    ${ground(198)}${tree(44, 162, 26)}${tree(360, 160, 28, "b")}${person(140, 228, "#E8913A")}${person(260, 228, "#2F6FD0")}`),

  museum: () => wrap("Illustration: a white historic house with a portico and smoke curling from the chimney", `${sky(id("s"))}${sun(64, 48, 16)}
    ${cloud(52, 1, 62, -35)}
    <rect class="chim" x="250" y="72" width="12" height="30"/>
    <g class="i-smoke"><circle cx="256" cy="66" r="5"/><circle cx="260" cy="56" r="6"/><circle cx="254" cy="44" r="7"/></g>
    <rect class="white" x="110" y="110" width="180" height="90"/><path class="roof dark" d="M102 112 L128 90 H272 L298 112Z"/>
    <path class="white" d="M168 128 L200 104 L232 128Z"/><path class="trim" d="M168 128 L200 104 L232 128"/>
    <g class="white">${[172,186,200,214,228].map(x => `<rect x="${x - 2}" y="128" width="5" height="72"/>`).join("")}</g>
    ${windows(122, 124, 2, 2, 12, 20, 22, 36, "lit")}${windows(254, 124, 2, 2, 12, 20, 22, 36, "lit")}
    ${ground(198)}<path class="walk" d="M190 198 H210 L230 250 H170Z"/>${tree(50, 160, 30)}${tree(356, 162, 28, "b")}`),

  gate: () => wrap("Illustration: the campus gate on a street with a car driving past", `${sky(id("s"))}${sun(330, 50)}
    ${cloud(48, .9, 50, -20)}
    ${tree(70, 120, 32)}${tree(330, 118, 34, "b")}
    <rect class="brick" x="120" y="96" width="26" height="104"/><rect class="brick" x="254" y="96" width="26" height="104"/>
    <rect class="stone" x="116" y="90" width="34" height="8"/><rect class="stone" x="250" y="90" width="34" height="8"/>
    <path class="iron" d="M146 108 Q200 84 254 108 M146 120 H254 ${[160,174,188,200,212,226,240].map(x => `M${x} 104 V200`).join(" ")}"/>
    ${ground(198)}<rect class="road" x="0" y="214" width="400" height="36"/><path class="lane" d="M0 232 H400"/>
    <g class="i-lamp2"><path class="iron" d="M350 214 V150"/><circle class="lampglow" cx="350" cy="148" r="5"/></g>
    <g class="i-car"><rect class="car" x="0" y="-14" width="46" height="14" rx="4"/><path class="car" d="M8 -14 L14 -24 H32 L38 -14Z"/><rect class="carwin" x="15" y="-22" width="16" height="7" rx="1"/><circle class="tyre" cx="10" cy="0" r="5"/><circle class="tyre" cx="36" cy="0" r="5"/></g>`),
};
const scene = key => (SCENES[key] || SCENES.keyser)();

/* ---------- building cards: one generated building per name ---------- */
const WALLS = ["#A84A2F","#9C4128","#B5563A","#94432E","#A9573F"];
const MODERN = new Set(["Malone Hall","Hackerman Hall","Brody Learning Commons","Bloomberg Center for Physics and Astronomy","Bloomberg Student Center","Charles Commons","Mattin Center","Ralph S. O'Connor Recreation Center"]);
const gear = (cx, cy, r = 12) => `<g class="i-gear" style="transform-origin:${cx}px ${cy}px"><circle class="gear" cx="${cx}" cy="${cy}" r="${r}"/>${[0,45,90,135,180,225,270,315].map(a => `<rect class="gear" x="${cx - r * .3}" y="${cy - r * 1.4}" width="${r * .6}" height="${r * .6}" transform="rotate(${a} ${cx} ${cy})"/>`).join("")}<circle class="gearhole" cx="${cx}" cy="${cy}" r="${r * .38}"/></g>`;
const flag = (px, base) => `<path class="iron" d="M${px} ${base} V${base - 40}"/><path class="i-flag" style="transform-origin:${px}px ${base - 34}px" d="M${px} ${base - 40} Q${px + 16} ${base - 46} ${px + 32} ${base - 38} Q${px + 16} ${base - 30} ${px} ${base - 32}Z"/>`;
// Type-specific animated details. g = building geometry {x, top, w}.
const EXTRA = {
  Engineering: g => gear(g.x + g.w - 22, g.top - 16),
  Science: g => `<g transform="translate(${g.x + g.w + 26} 180)"><path class="flask" d="M-6 -22 H6 V-8 L16 14 Q18 20 12 20 H-12 Q-18 20 -16 14 L-6 -8Z"/><path class="liquid" d="M-12 8 H12 L15 14 Q16 18 12 18 H-12 Q-16 18 -15 14Z"/>${[0,1,2].map(i => `<circle class="i-bubble" style="--dl:${-i * .7}s" cx="${-4 + i * 4}" cy="6" r="2.4"/>`).join("")}</g>`,
  Library: g => `<g class="i-book" style="--bx:200px;--by:${g.top + 6}px"><rect x="-10" y="-7" width="20" height="14" rx="1"/><path d="M0 -7 V7"/></g>`,
  "Student life": g => flag(g.x + g.w - 24, g.top - 4),
  Visitors: g => flag(g.x + g.w - 24, g.top - 4),
  Recreation: () => `<g class="i-ball"><circle class="ball" cx="330" cy="212" r="9"/><path class="seam" d="M321 212 H339 M330 203 Q336 212 330 221"/></g>`,
  "Shuttle stop": () => `<rect class="road" x="0" y="214" width="400" height="36"/><g class="i-car bus"><rect class="busbody" x="0" y="-26" width="86" height="26" rx="5"/>${[8,26,44,62].map(x => `<rect class="carwin" x="${x}" y="-21" width="14" height="10" rx="1"/>`).join("")}<circle class="tyre" cx="18" cy="0" r="6"/><circle class="tyre" cx="68" cy="0" r="6"/></g>`,
  Events: () => ["♪","♫","♪"].map((n, i) => `<text class="i-note" style="--dl:${-i * 1.4}s;--x:${(i % 2 ? 1 : -1) * 16}px" x="${196 + i * 4}" y="190">${n}</text>`).join(""),
  Offices: () => birds(),
  Housing: () => "",
  Classrooms: () => person(120, 226, "#2F6FD0", "walk", 10) + person(280, 228, "#E8913A", "walk2", 12),
  "Arts & Sciences": () => birds(),
};
// Buildings that already have a detailed scene use it.
const OWN_SCENE = { "Gilman Hall": "gilman", "Brody Learning Commons": "brody", "Milton S. Eisenhower Library": "mse", "Shriver Hall": "shriver", "Homewood Museum": "museum" };
function building(name, type){
  if (OWN_SCENE[name]) return SCENES[OWN_SCENE[name]]();
  const r = rng(seedOf(name)), modern = MODERN.has(name) || type === "Recreation";
  const floors = 2 + Math.floor(r() * 3), w = 170 + Math.floor(r() * 70), h = 40 + floors * 26;
  const x = 200 - w / 2, top = 200 - h, cols = Math.max(4, Math.floor(w / 30));
  const wall = modern ? "" : WALLS[Math.floor(r() * WALLS.length)];
  const roofStyle = modern ? "flat" : ["pitch","pitch","cupola","flat"][Math.floor(r() * 4)];
  const portico = !modern && (type === "Arts & Sciences" || type === "Museum" || type === "Events" || r() > .7);
  const pal = type === "Museum" ? "white" : modern ? "glass" : "";
  let roof = "";
  if (roofStyle === "pitch") roof = `<path class="roof" d="M${x - 6} ${top + 2} L${x + 18} ${top - 16} H${x + w - 18} L${x + w + 6} ${top + 2}Z"/>`;
  if (roofStyle === "cupola") roof = `<path class="roof" d="M${x - 6} ${top + 2} L${x + 18} ${top - 16} H${x + w - 18} L${x + w + 6} ${top + 2}Z"/><rect class="stone" x="188" y="${top - 40}" width="24" height="26"/><path class="dome" d="M186 ${top - 38} Q200 ${top - 62} 214 ${top - 38}Z"/>`;
  if (roofStyle === "flat") roof = `<rect class="stone" x="${x - 4}" y="${top - 6}" width="${w + 8}" height="8" rx="2"/>`;
  const body = pal === "white" ? `<rect class="white" x="${x}" y="${top}" width="${w}" height="${h}"/>`
    : pal === "glass" ? `<rect class="glass" x="${x}" y="${top}" width="${w}" height="${h}"/>`
    : `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${wall}"/>`;
  const win = windows(x + 12, top + 12, cols, floors, pal === "glass" ? 20 : 12, 16, (w - 24) / cols, 26, pal === "glass" ? "glow" : "lit");
  const por = portico ? `<path class="${pal === "white" ? "white" : "stone"}" d="M168 ${top + 18} L200 ${top - 2} L232 ${top + 18}Z"/><g class="${pal === "white" ? "white" : "stone"}">${[172,186,200,214,228].map(c => `<rect x="${c - 2}" y="${top + 18}" width="5" height="${h - 18}"/>`).join("")}</g>` : `<rect class="door" x="188" y="174" width="24" height="26" rx="3"/>`;
  const label = `Illustration of ${name}`;
  return wrap(label, `${sky(id("b"))}${sun(60 + r() * 40, 40 + r() * 16, 14)}${cloud(40 + r() * 30, .8, 44 + r() * 20, -r() * 40)}
    ${type === "Museum" ? `<rect class="chim" x="258" y="${top - 20}" width="12" height="24"/>` : ""}
    ${body}${roof}${win}${por}${ground(198)}${tree(30 + r() * 20, 160, 22)}${tree(372 - r() * 20, 162, 24, "b")}${(EXTRA[type] || (() => ""))({x, top, w})}`, "bld");
}

/* ---------- pause animations when off screen ---------- */
let io = null;
if ("IntersectionObserver" in window) io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("run", e.isIntersecting)), {rootMargin: "60px"});
function watch(root = document){
  root.querySelectorAll("svg.ill:not([data-w])").forEach(s => { s.dataset.w = "1"; io ? io.observe(s) : s.classList.add("run"); });
}

window.BJB_ART = { scene, building, watch, scenes: Object.keys(SCENES) };
})();

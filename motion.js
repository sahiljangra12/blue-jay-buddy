// Motion: the hero slideshow (slow cross-fades with a gentle drift), photo panels that come alive as you
// scroll to them, and background videos that only play while they are on screen.
// Everything stops for people who ask their device for reduced motion, and every moving thing can be paused.
(() => {
"use strict";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const PICS = window.BJB_PICS || {}, srcset = window.BJB_SRCSET, credit = window.BJB_CREDIT;
const PLACES = { "quad-dusk": "Wyman Quad at dusk", "quad-spring": "Wyman Quad in spring", "gilman-snow": "Gilman Hall in the snow", "gilman": "Gilman Hall",
  "decker": "Decker Quad", "gilman-tower": "Gilman Hall clock tower", "harbor-sunset": "Inner Harbor at sunset", "mason": "Mason Hall", "skyline-night": "Baltimore at night" };

/* ---------- hero slideshow ---------- */
const show = document.getElementById("heroShow"), btn = document.getElementById("showBtn");
let slides = [], i = 0, timer = null, paused = reduced, visible = true;
function label(k){ document.getElementById("heroPlace").textContent = PLACES[k] || ""; document.getElementById("heroCredit").innerHTML = credit ? credit(k) : ""; }
function build(){
  const H = window.BJB_HERO; if (!H || !show || !srcset) return false;
  const first = show.querySelector("img");
  first.srcset = srcset(H.first); first.src = `assets/photos/${H.first}-1600.webp`; first.alt = PLACES[H.first] || ""; first.dataset.key = H.first;
  slides = [first, ...H.slides.slice(1).map(k => { const im = document.createElement("img"); im.className = "slide"; im.alt = PLACES[k] || ""; im.dataset.key = k; im.decoding = "async"; im.sizes = "100vw"; show.insertBefore(im, show.querySelector("figcaption")); return im; })];
  label(H.first);
  return true;
}
function load(im){ if (!im.src){ im.srcset = srcset(im.dataset.key); im.src = `assets/photos/${im.dataset.key}-1600.webp`; } }
function go(n){
  const cur = slides[i]; i = (n + slides.length) % slides.length; const nx = slides[i];
  load(nx); load(slides[(i + 1) % slides.length]);
  const swap = () => { nx.classList.remove("drift-a", "drift-b"); void nx.offsetWidth; nx.classList.add(i % 2 ? "drift-b" : "drift-a", "on"); cur.classList.remove("on"); label(nx.dataset.key); };
  nx.complete && nx.naturalWidth ? swap() : nx.addEventListener("load", swap, { once: true });
}
function tick(){ clearInterval(timer); if (!paused && visible && !document.hidden) timer = setInterval(() => go(i + 1), 7000); }
function setPaused(p){ paused = p; btn.setAttribute("aria-pressed", p); btn.setAttribute("aria-label", p ? "Play the slideshow" : "Pause the slideshow");
  btn.innerHTML = p ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  show.classList.toggle("still", p); tick(); }
if (build()){
  slides[0].classList.add("drift-a");
  if (slides.length > 1) load(slides[1]);
  btn.addEventListener("click", () => setPaused(!paused));
  setPaused(paused);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; tick(); }).observe(show);
  document.addEventListener("visibilitychange", tick);
} else if (btn) btn.hidden = true;

/* ---------- panels and videos ---------- */
const seen = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add("inview"); seen.unobserve(e.target); } }), { threshold: .25 });
const vids = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target.querySelector("video"); if (!v || e.target.dataset.paused === "1" || reduced) return;
  e.isIntersecting ? v.play().catch(() => {}) : v.pause();
}), { threshold: .35 });
let vcred = null;
fetch("assets/video/videos.json").then(r => r.ok ? r.json() : {}).then(j => { vcred = j; scan(); }).catch(() => {});
function scan(){
  document.querySelectorAll(".panel:not([data-m]), .sec-banner:not([data-m])").forEach(p => { p.dataset.m = "1"; reduced ? p.classList.add("inview") : seen.observe(p); });
  document.querySelectorAll(".panel.video").forEach(p => {
    const c = p.querySelector("#vidCredit"); const k = "baltimore-aerial";
    if (c && vcred && vcred[k] && !c.innerHTML) c.innerHTML = `<a href="${vcred[k].page}" target="_blank" rel="noopener">Video: ${vcred[k].author}, ${vcred[k].license}</a>`;
    if (p.dataset.v) return; p.dataset.v = "1"; vids.observe(p);
    const b = p.querySelector(".vid-btn"), v = p.querySelector("video");
    if (reduced){ b.setAttribute("aria-pressed", "true"); p.dataset.paused = "1"; }
    b.addEventListener("click", () => { const now = p.dataset.paused !== "1"; p.dataset.paused = now ? "1" : ""; b.setAttribute("aria-pressed", now); b.setAttribute("aria-label", now ? "Play the video" : "Pause the video"); now ? v.pause() : v.play().catch(() => {}); });
  });
}
new MutationObserver(scan).observe(document.getElementById("main"), { childList: true });
scan();
})();

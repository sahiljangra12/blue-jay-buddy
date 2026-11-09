// "Near you": the closest Hopkins shuttle stops to where you are, with walking time and live arrivals.
// Uses the browser's location only after you tap "Use my location". Your position is used here on your
// device to measure distances and is never sent anywhere (the shuttle feed is asked for times, not for you).
(() => {
"use strict";
const LIVE = window.BJB_LIVE, A = () => window.BJB_APP;
const FEED = "https://jhu.transloc.com/Services/JSONPRelay.svc", KEY = "8882812681";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const clean = s => (s || "").replace(/\s*\(\d+\)\s*$/, "").replace("Comons", "Commons");
const ROUTES = LIVE ? LIVE.ROUTES : [];
const RID = new Set(ROUTES.map(r => r.id));
const short = id => (ROUTES.find(r => r.id === id) || {}).short || "Shuttle";
let pos = null, stopsCache = null, busy = false, err = "", timer = null;

// Distance in meters between two points.
function meters(a, b){ const R = 6371e3, t = x => x * Math.PI / 180, dLa = t(b.lat - a.lat), dLo = t(b.lng - a.lng);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
// Every stop on the student routes, grouped by physical stop.
async function stops(){
  if (stopsCache) return stopsCache;
  const r = await fetch(`${FEED}/GetRoutesForMapWithScheduleWithEncodedLine?apiKey=${KEY}&isDispatch=false`);
  const routes = await r.json(), by = {};
  routes.filter(rt => RID.has(rt.RouteID)).forEach(rt => (rt.Stops || []).forEach(s => {
    if (!s.Latitude) return;
    const id = s.AddressID ?? `${s.Latitude},${s.Longitude}`;
    const st = by[id] ||= { id, name: clean(s.Description || s.Name), lat: s.Latitude, lng: s.Longitude, routes: [] };
    const rsid = s.RouteStopID ?? s.RouteStopId;
    if (!st.routes.find(x => x.route === rt.RouteID)) st.routes.push({ route: rt.RouteID, rsid });
  }));
  return stopsCache = Object.values(by);
}
function locate(prompt){
  return new Promise((ok, bad) => {
    if (!navigator.geolocation) return bad(new Error("Your browser can't share location."));
    navigator.geolocation.getCurrentPosition(p => ok({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }),
      e => bad(new Error(e.code === 1 ? "Location is turned off for this site. Turn it on in your browser's site settings to see shuttles near you." : "Couldn't find your location. Try again outside or near a window.")),
      { enableHighAccuracy: !!prompt, timeout: 12000, maximumAge: 60000 });
  });
}
const walk = m => Math.max(1, Math.round(m / 80)); // about 80 m a minute
const dist = m => m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1609).toFixed(1)} mi`;
async function compute(){
  const all = await stops();
  const near = all.map(s => ({ ...s, d: meters(pos, s) })).sort((a, b) => a.d - b.d).slice(0, 3);
  let arr = [];
  try { arr = await LIVE.arrivals([...new Set(near.flatMap(s => s.routes.map(r => r.route)))]); } catch {}
  near.forEach(s => s.next = s.routes.map(r => {
    const a = arr.find(x => x.route === r.route && (x.stopId === r.rsid));
    return { route: r.route, t: a && a.next.length ? a.next[0] : null };
  }).sort((x, y) => (x.t ? x.t.mins : 999) - (y.t ? y.t.mins : 999)));
  return near;
}
function html(near){
  if (!pos) return `<div class="near-cta"><div><span class="eyebrow">Near you</span><h2 class="ctx-title">Shuttles closest to you.</h2>
      <p class="note">Tap once to see the nearest Hopkins shuttle stops, the walk, and live arrival times. Your location stays on this device.</p>${err ? `<p class="warn">${esc(err)}</p>` : ""}</div>
      <button class="pill primary" type="button" data-near-on>${A().svg("mapPin")}Use my location</button></div>`;
  if (!near) return `<span class="eyebrow">Near you</span><p class="note">Finding stops near you…</p>`;
  const far = near[0] && near[0].d > 3000, h = new Date().getHours(), night = h >= 18 || h < 2;
  return `<div class="near-head"><div><span class="eyebrow"><span class="dot live" aria-hidden="true"></span> Near you</span><h2 class="ctx-title">${far ? "No Hopkins stops close by." : "Shuttles closest to you."}</h2></div>
    <button class="mini" type="button" data-near-refresh>${A().svg("refresh")}Update</button></div>
    ${far ? `<p class="note">The nearest stop is ${dist(near[0].d)} away. ${night ? "From 6 PM, a Night Ride can pick you up anywhere in its service area." : "The JHMI shuttle and the free Charm City Circulator connect Homewood with downtown."}</p>` : ""}
    <ul class="near-list">${near.map(s => `<li>
      <div class="near-stop"><b>${esc(s.name)}</b><span>${walk(s.d)} min walk · ${dist(s.d)}</span></div>
      <div class="near-routes">${s.next.slice(0, 3).map(n => `<span class="near-rt"><b>${esc(short(n.route))}</b>${n.t ? (n.t.mins === 0 || n.t.arriving ? "Now" : n.t.mins + " min") : "–"}</span>`).join("")}</div>
      <a class="mini" href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=walking" target="_blank" rel="noopener">${A().svg("walk")}Walk</a></li>`).join("")}</ul>
    ${night && !far ? `<p class="note">After 6 PM you can also request a free <button class="linkbtn" type="button" data-guide="bluejay">Night Ride</button>.</p>` : ""}
    <p class="note fine">Live times from the Hopkins shuttle tracker. "–" means no bus is scheduled soon.</p>`;
}
async function paint(prompt = false){
  const slots = document.querySelectorAll("[data-near-slot]"); if (!slots.length || busy) return;
  if (pos === null && get("bjb-near", false)){ try { pos = await locate(false); } catch (e) { err = e.message; } }
  if (!pos){ slots.forEach(s => s.innerHTML = html(null)); return; }
  busy = true;
  try { const near = await compute(); err = ""; document.querySelectorAll("[data-near-slot]").forEach(s => s.innerHTML = html(near)); }
  catch { document.querySelectorAll("[data-near-slot]").forEach(s => s.innerHTML = `<span class="eyebrow">Near you</span><p class="note">Couldn't load shuttle stops right now. <a href="https://jhu.transloc.com" target="_blank" rel="noopener">Open the shuttle tracker</a>.</p>`); }
  busy = false;
}
document.addEventListener("click", async e => {
  if (e.target.closest("[data-near-on]")){
    e.preventDefault(); const b = e.target.closest("[data-near-on]"); b.disabled = true; b.textContent = "Finding you…";
    try { pos = await locate(true); set("bjb-near", true); err = ""; } catch (x) { err = x.message; set("bjb-near", false); }
    paint(true);
  }
  if (e.target.closest("[data-near-refresh]")){ e.preventDefault(); try { pos = await locate(true); } catch (x) { err = x.message; } paint(); }
}, true);
const fill = () => { const s = document.querySelectorAll("[data-near-slot]:not([data-filled])"); if (!s.length) return; s.forEach(x => x.dataset.filled = "1"); paint(); };
new MutationObserver(fill).observe(document.getElementById("main"), { childList: true }); fill();
// Keep times fresh while a "Near you" card is on screen.
setInterval(() => { if (!document.hidden && pos && document.querySelector("[data-near-slot]")) paint(); }, 30000);
})();

// Live data for Today: weather, shuttle arrivals and campus events.
// Weather: Open-Meteo (free, no key). Shuttles: the same public feed the official Hopkins shuttle
// tracker (jhu.transloc.com) uses. Events: events.json, built every two hours from Hopkins Groups'
// public calendar by a GitHub Action (scripts/build-events.mjs).
(() => {
"use strict";
const HOMEWOOD = { lat: 39.3299, lon: -76.6205 };
const SHUTTLE = "https://jhu.transloc.com/Services/JSONPRelay.svc";
const SHUTTLE_KEY = "8882812681"; // public key built into the official tracker map

const cache = {};
async function getJSON(url, ttlMs, timeout = 10000){
  const hit = cache[url];
  if (hit && Date.now() - hit.t < ttlMs) return hit.data;
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctl.signal, cache: "no-store" });
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();
    cache[url] = { t: Date.now(), data };
    return data;
  } finally { clearTimeout(t); }
}

/* ---------- weather ---------- */
const WMO = { 0:"Clear",1:"Mostly clear",2:"Partly cloudy",3:"Cloudy",45:"Fog",48:"Fog",51:"Drizzle",53:"Drizzle",55:"Drizzle",56:"Freezing drizzle",57:"Freezing drizzle",
  61:"Light rain",63:"Rain",65:"Heavy rain",66:"Freezing rain",67:"Freezing rain",71:"Light snow",73:"Snow",75:"Heavy snow",77:"Snow",80:"Showers",81:"Showers",82:"Heavy showers",85:"Snow showers",86:"Snow showers",95:"Thunderstorms",96:"Thunderstorms",99:"Thunderstorms" };
async function weather(){
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${HOMEWOOD.lat}&longitude=${HOMEWOOD.lon}&current=temperature_2m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&temperature_unit=fahrenheit&timezone=America%2FNew_York&forecast_days=2`;
  const d = await getJSON(u, 20 * 6e4);
  const hours = d.hourly.time.map((t, i) => ({ t: new Date(t), temp: Math.round(d.hourly.temperature_2m[i]), rain: d.hourly.precipitation_probability[i] ?? 0, code: d.hourly.weather_code[i] }));
  return { temp: Math.round(d.current.temperature_2m), code: d.current.weather_code, text: WMO[d.current.weather_code] || "", hours };
}
// Advice for a time window, e.g. while you're walking to and from class.
function advice(w, from, to, label){
  if (!w) return null;
  const win = w.hours.filter(h => h.t >= new Date(from.getTime() - 36e5) && h.t <= to);
  if (!win.length) return null;
  const wet = win.find(h => h.rain >= 50 || [61,63,65,80,81,82,95,96,99].includes(h.code));
  const snow = win.find(h => [71,73,75,77,85,86].includes(h.code));
  const cold = Math.min(...win.map(h => h.temp));
  const at = h => h.t.toLocaleTimeString([], { hour: "numeric" });
  if (snow) return { kind: "snow", text: `Snow likely around ${at(snow)}. Wear boots${label ? ` for ${label}` : ""}.` };
  if (wet) return { kind: "rain", text: `Rain likely around ${at(wet)} (${wet.rain}%). Take an umbrella${label ? ` for ${label}` : ""}.` };
  if (cold <= 32) return { kind: "cold", text: `Below freezing (${cold}°F)${label ? ` around ${label}` : ""}. Wear a warm coat.` };
  return null;
}

/* ---------- shuttles ---------- */
const msDate = s => { const m = /Date\((\d+)/.exec(s || ""); return m ? +m[1] : null; };
// Routes students at Homewood actually use, with plain names.
const ROUTES = [
  { id: 26, name: "JHMI (Homewood · Penn Station · Peabody · hospital)", short: "JHMI" },
  { id: 29, name: "Keswick · Homewood · East Baltimore (local)", short: "Keswick local" },
  { id: 30, name: "Keswick · East Baltimore (express)", short: "Keswick express" },
  { id: 43, name: "Keswick · Penn Station commuter", short: "Keswick–Penn" },
  { id: 33, name: "Remington", short: "Remington" },
  { id: 4,  name: "Hampden Circulator", short: "Hampden" },
  { id: 24, name: "Giant Night Ride", short: "Night Ride" },
  { id: 32, name: "Mt. Washington", short: "Mt. Washington" },
  { id: 22, name: "Bayview Express", short: "Bayview" },
  { id: 23, name: "Homewood · Carey Business School", short: "Carey" },
  { id: 31, name: "Film Centre / CVA", short: "Film Centre" },
];
// Homewood boarding stops for the JHMI, in the order the bus reaches them.
const JHMI_HOMEWOOD = [157, 158, 159]; // Charles Commons, Interfaith Center, Barnes & Noble
const cleanStop = s => (s || "").replace(/\s*\(\d+\)\s*$/, "").replace("Comons", "Commons");

async function arrivals(routeIds){
  const data = await getJSON(`${SHUTTLE}/GetStopArrivalTimes?apiKey=${SHUTTLE_KEY}&routeIds=${routeIds.join(",")}&version=2`, 25e3);
  const now = Date.now();
  return data.map(s => ({
    route: s.RouteId, stopId: s.RouteStopId, stop: cleanStop(s.StopDescription), color: s.Color,
    next: (s.Times || []).filter(t => !t.IsDeparted).map(t => {
      const at = msDate(t.EstimateTime) || msDate(t.Time) || (t.Seconds != null ? now + t.Seconds * 1000 : null);
      return at ? { at, mins: Math.max(0, Math.round((at - now) / 6e4)), arriving: !!t.IsArriving } : null;
    }).filter(Boolean).slice(0, 2),
  }));
}
async function vehicles(){
  const v = await getJSON(`${SHUTTLE}/GetMapVehiclePoints?apiKey=${SHUTTLE_KEY}&isPublicMap=true`, 25e3);
  const count = {}; v.forEach(x => { if (x.IsOnRoute) count[x.RouteID] = (count[x.RouteID] || 0) + 1; });
  return count;
}
async function jhmiNext(){
  const list = await arrivals([26]);
  const stops = JHMI_HOMEWOOD.map(id => list.find(s => s.stopId === id)).filter(s => s && s.next.length);
  stops.sort((a, b) => a.next[0].at - b.next[0].at);
  return stops[0] ? { stop: stops[0].stop, mins: stops[0].next[0].mins, arriving: stops[0].next[0].arriving, all: stops } : null;
}

/* ---------- events ---------- */
async function events(){
  return getJSON(`events.json?d=${new Date().toISOString().slice(0, 13)}`, 30 * 6e4);
}

window.BJB_LIVE = { weather, advice, arrivals, vehicles, jhmiNext, events, ROUTES, WMO };
})();

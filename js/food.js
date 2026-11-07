// Food & Money: weekly budget planner, nearby food (live map data), groceries, student deals and apps.
(() => {
"use strict";
const App = window.App, { esc, svg, money, store } = App;
const F = window.BJB_FOOD;
const SUBS = [["plan","My budget"],["nearby","Eat nearby"],["groceries","Groceries"],["deals","Deals & apps"]];
const HOMEWOOD = { lat: 39.3289, lon: -76.6205 };

/* ---------- budget state ---------- */
const B = App.budget = Object.assign({ weekly: 65, diet: "veg", cook: "some", spends: [] }, store.get("bjb-budget", {}));
const saveB = () => store.set("bjb-budget", B);
const weekStart = () => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); }; // Monday
App.spentThisWeek = () => B.spends.filter(s => s.at >= weekStart()).reduce((a, s) => a + s.amt, 0);
App.budgetLeft = () => B.weekly - App.spentThisWeek();
const dietOk = p => {
  const d = B.diet;
  if (d === "nonveg") return true;
  if (d === "vegan") return p.diet.includes("vg");
  return p.diet.includes("v") || p.diet.includes("vg") || p.diet.includes("v?");
};
const pickFor = p => B.diet === "nonveg" ? p.pick : p.vegPick;
const avg = p => (p.lo + p.hi) / 2;

/* ---------- the optimiser ---------- */
// Splits the week into home-cooked meals (grocery basket) and meals out, and fills meals out
// with places that fit what's left, cheapest-fitting first and no place twice.
App.planWeek = () => {
  const basketKey = B.diet === "vegan" ? "vegan" : B.diet === "egg" ? "egg" : B.diet === "nonveg" ? "nonveg" : "veg";
  const basket = F.baskets[basketKey];
  const full = basket.items.reduce((a, [, p]) => a + p, 0);
  const share = { most: 1, some: 0.7, none: 0.3 }[B.cook];
  const groceries = Math.round(full * share);
  const outMeals = { most: 2, some: 4, none: 8 }[B.cook];
  const left = Math.max(0, App.budgetLeft() - (B.spends.some(s => s.cat === "groceries" && s.at >= weekStart()) ? 0 : groceries));
  const per = outMeals ? left / outMeals : 0;
  const options = F.places.filter(p => dietOk(p) && !p.swipe).sort((a, b) => avg(a) - avg(b));
  const meals = [];
  let rest = left;
  for (let i = 0; i < outMeals; i++){
    // Fair share of what's left for each remaining meal; take the nicest place that fits it.
    const allowance = rest / (outMeals - i);
    const fit = options.filter(p => !meals.includes(p) && avg(p) <= allowance + 0.5);
    const p = fit[fit.length - 1];
    if (!p) break;
    meals.push(p); rest -= avg(p);
  }
  return { basket, basketKey, groceries, full, outMeals, meals, perMeal: per, leftAfter: Math.round(rest), total: groceries + meals.reduce((a, p) => a + avg(p), 0) };
};

App.views.food = (sub) => {
  sub = SUBS.some(s => s[0] === sub) ? sub : "plan";
  return `<section class="page">${App.head("Food & Money")}${App.subnav("food", SUBS, sub)}${({ plan, nearby, groceries, deals })[sub]()}</section>`;
};

/* ---------- My budget ---------- */
function plan(){
  const spent = App.spentThisWeek(), left = B.weekly - spent, pct = Math.min(100, Math.round(spent / B.weekly * 100));
  const W = App.planWeek();
  return `
  <div class="budget">
    <div class="b-top"><div><span class="eyebrow">This week (Mon–Sun)</span><b class="b-left ${left < 0 ? "bad" : ""}">${money(Math.abs(left))} ${left < 0 ? "over" : "left"}</b>
      <span class="note">${money(spent)} spent of ${money(B.weekly)}</span></div>
      <button class="btn sm soft" type="button" data-budget-settings>${svg("edit")}Budget & diet</button></div>
    <div class="bar"><span style="width:${pct}%" class="${pct > 90 ? "hot" : ""}"></span></div>
    <form class="spend" id="spendForm">
      <input name="amt" type="number" inputmode="decimal" step="0.01" min="0" placeholder="$ spent" aria-label="Amount spent" required>
      <select name="cat" aria-label="Category"><option value="eat-out">Eating out</option><option value="groceries">Groceries</option><option value="campus">Campus / J-Cash</option><option value="delivery">Delivery</option><option value="other">Other</option></select>
      <input name="note" placeholder="What (optional)" maxlength="40" aria-label="Note">
      <button class="btn primary" type="submit">${svg("plus")}Log</button>
    </form>
  </div>

  <h3 class="grp">Your plan for the rest of the week</h3>
  <p class="note">Built for ${esc({ veg:"vegetarian", egg:"vegetarian + eggs", vegan:"vegan", nonveg:"non-vegetarian" }[B.diet])}, cooking ${esc({ most:"most meals", some:"some meals", none:"rarely" }[B.cook])}. Prices are typical estimates; check the live menu.</p>
  <div class="plan">
    <div class="tile">
      <span class="eyebrow">${svg("cart", 'width="14" height="14"')} Groceries · about ${money(W.groceries)}</span>
      <ul class="basket">${W.basket.items.slice(0, Math.ceil(W.basket.items.length * ({ most: 1, some: .7, none: .4 })[B.cook])).map(([n, p]) => `<li><span>${esc(n)}</span><span>${money(p)}</span></li>`).join("")}</ul>
      <div class="row"><a class="btn sm soft" href="https://giantfood.com" target="_blank" rel="noopener">Order on Giant</a><a class="btn sm soft" href="#food/groceries">Other stores</a></div>
    </div>
    <div class="tile">
      <span class="eyebrow">${svg("food", 'width="14" height="14"')} ${W.meals.length} meals out · about ${money(Math.round(W.perMeal))} each</span>
      ${W.meals.length ? `<ol class="meals">${W.meals.map(p => `<li><b>${esc(p.n)}</b><span>${esc(pickFor(p))}</span><span class="price">${money(p.lo)}–${money(p.hi)}</span></li>`).join("")}</ol>`
        : `<p class="note">Your budget is used up for meals out this week. Try campus dining swipes, the <a href="https://studentaffairs.jhu.edu/student-outreach-support/hopkins-food-pantry" target="_blank" rel="noopener">Hopkins Food Pantry</a>, or Too Good To Go.</p>`}
    </div>
  </div>
  <div class="tips-box"><b>Ways to stretch ${money(B.weekly)}</b><ul class="bul">
    <li>Too Good To Go surprise bags from Baltimore bakeries and cafés cost about a third of the usual price.</li>
    <li>Delivery adds fees and higher menu prices. Pick up instead, or use DashPass for Students ($4.99/month) only if you order 3+ times a month.</li>
    <li>Cook rice and lentils (or chicken) in bulk on Sunday: about $1–2 a serving.</li>
    <li>The Hopkins Food Pantry is free for students. No questions asked.</li></ul></div>
  ${B.spends.filter(s => s.at >= weekStart()).length ? `<h3 class="grp">Logged this week</h3><ul class="dls">${B.spends.filter(s => s.at >= weekStart()).slice().reverse().map(s => `<li class="dl"><div class="dl-main"><b>${money(s.amt)} · ${esc(s.cat.replace("-", " "))}</b><span>${esc(s.note || "")} · ${new Date(s.at).toLocaleDateString([], { weekday:"short" })}</span></div><button class="mini" type="button" data-del-spend="${s.at}" aria-label="Delete">${svg("trash")}</button></li>`).join("")}</ul>` : ""}`;
}

App.budgetSheet = () => App.openSheet(`${App.sheetHead("Budget & diet")}
  <form class="form" id="budgetForm">
    <label class="field">Weekly food budget ($)<input name="weekly" type="number" min="10" max="500" step="1" value="${B.weekly}" required></label>
    <fieldset><legend>What do you eat?</legend><div class="opts">${[["veg","Vegetarian"],["egg","Vegetarian + eggs"],["vegan","Vegan"],["nonveg","Non-vegetarian"]].map(([v, l]) => `<label class="chip"><input type="radio" name="diet" value="${v}" ${B.diet === v ? "checked" : ""}><span>${l}</span></label>`).join("")}</div></fieldset>
    <fieldset><legend>How often do you cook?</legend><div class="opts">${[["most","Most meals"],["some","Some meals"],["none","Rarely"]].map(([v, l]) => `<label class="chip"><input type="radio" name="cook" value="${v}" ${B.cook === v ? "checked" : ""}><span>${l}</span></label>`).join("")}</div></fieldset>
    <div class="row"><button class="btn primary" type="submit">${svg("check")}Save</button></div>
  </form>`);

/* ---------- Eat nearby (live OpenStreetMap data) ---------- */
let near = { status: "idle", list: [], where: null };
App.placeCard = p => `<article class="item place">
  <div class="item-main"><h3>${esc(p.n)}</h3>
    <p>${esc(p.cui)} · ${esc(p.area)}${p.dist != null ? ` · ${p.dist < 1000 ? Math.round(p.dist / 10) * 10 + " m" : (p.dist / 1609).toFixed(1) + " mi"} (${Math.max(1, Math.round(p.dist / 80))} min walk)` : ""}</p>
    ${p.lo != null ? `<p class="when">${svg("wallet")}${p.swipe ? "Meal swipe" : `About ${money(p.lo)}–${money(p.hi)} per person`}${p.jcash ? " · takes J-Cash" : ""}</p>` : ""}
    ${p.vegPick || p.pick ? `<p class="pick">${B.diet === "nonveg" ? "Try: " + esc(p.pick) : "Veg pick: " + esc(p.vegPick)}</p>` : ""}
    ${p.tags ? `<p class="chips">${p.tags.map(t => `<span class="chip sm">${esc(t)}</span>`).join("")}</p>` : ""}
  </div>
  <div class="item-acts">
    <a class="btn sm" href="${p.lat ? `https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${p.lat},${p.lon}` : App.walkTo(p.n + ", " + p.area + ", Baltimore MD")}" target="_blank" rel="noopener">${svg("walk")}Go</a>
    ${!p.swipe ? `<a class="btn sm soft" href="https://www.doordash.com/search/store/${encodeURIComponent(p.n)}/" target="_blank" rel="noopener">DoorDash</a>
    <a class="btn sm soft" href="${App.maps(p.n + ", " + p.area + ", Baltimore MD")}" target="_blank" rel="noopener">Menu & hours</a>` : ""}
  </div></article>`;

function nearby(){
  const list = near.status === "done" ? near.list : F.places.map(p => Object.assign({}, p));
  const ok = list.filter(p => (p.diet ? dietOk(p) : true));
  const budgetMeal = App.budgetLeft() / ({ most: 2, some: 4, none: 8 }[B.cook] || 4);
  return `
  <div class="toolbar">
    <span class="note">${near.status === "done" ? `${near.list.length} places within a 12-minute walk${near.where === "campus" ? " of campus" : " of you"}` : `Popular spots near Homewood`} · showing ${esc({ veg:"vegetarian-friendly", egg:"vegetarian-friendly", vegan:"vegan-friendly", nonveg:"all" }[B.diet])}</span>
    <button class="btn sm primary" type="button" data-locate>${svg("pin")}${near.status === "loading" ? "Finding…" : "Use my location"}</button>
    <button class="btn sm soft" type="button" data-budget-settings>Diet</button>
  </div>
  ${near.status === "error" ? `<p class="note bad">${esc(near.err)}</p>` : ""}
  <div class="seg-filter" role="group" aria-label="Filter">${[["all","All"],["cheap","Under " + money(Math.max(8, Math.round(budgetMeal)))],["campus","On campus"],["breakfast","Breakfast & coffee"]].map(([v, l]) => `<button type="button" class="${(App.nearFilter || "all") === v ? "on" : ""}" data-near-filter="${v}">${esc(l)}</button>`).join("")}</div>
  <div class="list">${ok.filter(p => {
    const f = App.nearFilter || "all";
    if (f === "cheap") return p.lo != null && p.lo <= Math.max(8, budgetMeal);
    if (f === "campus") return p.tag === "campus";
    if (f === "breakfast") return p.tag === "breakfast" || p.tag === "coffee" || /cafe|coffee|bakery|bagel/i.test(p.cui);
    return true;
  }).map(App.placeCard).join("") || `<p class="note">Nothing matches that filter.</p>`}</div>
  <p class="note">Places come from OpenStreetMap; prices are our typical estimates (checked ${App.monthLabel(F.checked)}). Tap “Menu & hours” for today's prices.</p>`;
}

async function locate(){
  near.status = "loading"; App.render();
  let pos = HOMEWOOD, where = "campus";
  try {
    const p = await new Promise((ok, bad) => navigator.geolocation.getCurrentPosition(ok, bad, { timeout: 8000, maximumAge: 300000 }));
    pos = { lat: p.coords.latitude, lon: p.coords.longitude }; where = "you";
    if (dist(pos, HOMEWOOD) > 40000){ pos = HOMEWOOD; where = "campus"; } // far from Baltimore: show campus
  } catch {}
  const q = `[out:json][timeout:20];(nwr(around:1000,${pos.lat},${pos.lon})[amenity~"^(restaurant|fast_food|cafe|food_court|ice_cream)$"][name];);out center tags 120;`;
  try {
    const r = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "content-type": "application/x-www-form-urlencoded" } });
    const j = await r.json();
    near.list = j.elements.map(el => {
      const t = el.tags, lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
      const known = F.places.find(p => p.n.toLowerCase().split(/[ (&]/)[0] === t.name.toLowerCase().split(/[ (&]/)[0]);
      const diet = ["nv"]; if (t["diet:vegetarian"] && t["diet:vegetarian"] !== "no") diet.push("v"); if (t["diet:vegan"] && t["diet:vegan"] !== "no") diet.push("vg"); if (t["diet:halal"] === "yes") diet.push("h");
      if (/indian|vegetarian|vegan|pizza|mexican|thai|mediterranean|falafel|cafe|coffee|bagel|bakery|ice_cream|sandwich|noodle|chinese|japanese|sushi|korean/i.test((t.cuisine || "") + el.tags.amenity)) diet.push("v?");
      const tags = [t.cuisine && t.cuisine.replace(/_/g, " ").replace(/;/g, ", "), t.opening_hours && "Hours listed", diet.includes("v") && "Vegetarian options", diet.includes("vg") && "Vegan options", diet.includes("h") && "Halal"].filter(Boolean);
      return Object.assign({ n: t.name, cui: (t.cuisine || t.amenity).replace(/_/g, " ").replace(/;/g, ", "), area: [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ") || "Nearby", diet, tags, lat, lon, dist: dist(pos, { lat, lon }), tag: t.amenity === "cafe" ? "coffee" : "" },
        known ? { lo: known.lo, hi: known.hi, vegPick: known.vegPick, pick: known.pick, diet: [...new Set([...known.diet, ...diet])], cui: known.cui, tag: known.tag } : {});
    }).sort((a, b) => a.dist - b.dist);
    near.status = "done"; near.where = where;
  } catch (e) { near.status = "error"; near.err = "Couldn't load nearby places right now. Showing popular spots instead."; }
  App.render();
}
const dist = (a, b) => { const R = 6371000, r = x => x * Math.PI / 180, dLat = r(b.lat - a.lat), dLon = r(b.lon - a.lon); const h = Math.sin(dLat/2)**2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon/2)**2; return 2 * R * Math.asin(Math.sqrt(h)); };

/* ---------- Groceries ---------- */
function groceries(){
  const keys = ["veg","egg","vegan","nonveg"];
  return `
  <p class="note">A week of groceries for one person, estimated from typical Baltimore supermarket prices (checked ${App.monthLabel(F.checked)}). Your total will vary.</p>
  <div class="grid2">${keys.map(k => { const b = F.baskets[k], tot = b.items.reduce((a, [, p]) => a + p, 0); return `<div class="tile ${k === (B.diet) ? "mine" : ""}">
    <span class="eyebrow">${esc(b.label)}${k === B.diet ? " · your diet" : ""}</span><b class="t2">About ${money(tot)} / week</b>
    <ul class="basket">${b.items.map(([n, p]) => `<li><span>${esc(n)}</span><span>${money(p)}</span></li>`).join("")}</ul></div>`; }).join("")}</div>
  <h3 class="grp">Where to buy</h3>
  <div class="list">${F.stores.map(s => `<article class="item"><div class="item-main"><h3>${esc(s.n)}</h3><p>${esc(s.how)}</p>${s.tip ? `<p class="when">${svg("tag")}${esc(s.tip)}</p>` : ""}</div>
    <div class="item-acts">${s.u ? `<a class="btn sm" href="${esc(s.u)}" target="_blank" rel="noopener">Open ${svg("open")}</a>` : ""}${s.maps ? `<a class="btn sm soft" href="${App.walkTo(s.maps)}" target="_blank" rel="noopener">${svg("walk")}Directions</a>` : ""}</div></article>`).join("")}</div>`;
}

/* ---------- Deals & apps ---------- */
App.dealCard = d => `<article class="item deal"><div class="item-main"><h3>${esc(d.n)}</h3><p>${esc(d.what)}</p>
  <p class="when">${svg("shield")}How to get it: ${esc(d.verify)}</p></div>
  <div class="item-acts">${d.ref || d.u ? `<a class="btn sm" href="${esc(d.ref || d.u)}" target="_blank" rel="noopener${d.ref ? " sponsored" : ""}">Get it ${svg("open")}</a>` : ""}</div></article>`;
function deals(){
  const cats = [["food","Food & delivery"],["shopping","Shopping"],["subscriptions","Music & streaming"],["software","Software"],["travel","Travel"],["fun","Fun"]];
  const anyRef = F.deals.some(d => d.ref) || F.apps.some(a => a.ref);
  return `
  ${anyRef ? `<p class="note">Some links are referral links. Blue Jay Buddy may earn a small bonus at no cost to you.</p>` : ""}
  <h3 class="grp">Apps students use</h3>
  <div class="apps-grid">${F.apps.map(a => `<a class="app-tile" href="${esc(a.ref || a.u)}" target="_blank" rel="noopener${a.ref ? " sponsored" : ""}"><b>${esc(a.n)}</b><span>${esc(a.why)}</span></a>`).join("")}</div>
  ${cats.map(([c, l]) => { const ds = F.deals.filter(d => d.cat === c); return ds.length ? `<h3 class="grp">${l}</h3><div class="list">${ds.map(App.dealCard).join("")}</div>` : ""; }).join("")}
  <p class="note">Deal terms change often. Checked ${App.monthLabel(F.checked)}; always confirm on the provider's page.</p>`;
}

/* ---------- events ---------- */
document.addEventListener("submit", e => {
  if (e.target.id === "spendForm"){
    e.preventDefault(); const f = new FormData(e.target), amt = parseFloat(f.get("amt"));
    if (!(amt > 0)) return;
    B.spends.push({ at: Date.now(), amt, cat: f.get("cat"), note: f.get("note").trim() });
    B.spends = B.spends.filter(s => s.at > Date.now() - 60 * 864e5);
    saveB(); App.toast(`${money(App.budgetLeft())} left this week`); App.render();
  }
  if (e.target.id === "budgetForm"){
    e.preventDefault(); const f = new FormData(e.target);
    B.weekly = Math.max(10, +f.get("weekly") || 65); B.diet = f.get("diet") || B.diet; B.cook = f.get("cook") || B.cook;
    saveB(); App.S.setupStep("budget"); App.closeSheet(); App.render();
  }
});
document.addEventListener("click", e => {
  const t = e.target;
  if (t.closest("[data-budget-settings]")) { e.preventDefault(); App.budgetSheet(); }
  if (t.closest("[data-locate]")) locate();
  const nf = t.closest("[data-near-filter]"); if (nf){ App.nearFilter = nf.dataset.nearFilter; App.render(); }
  const ds = t.closest("[data-del-spend]"); if (ds){ B.spends = B.spends.filter(s => String(s.at) !== ds.dataset.delSpend); saveB(); App.render(); }
});
})();

// Start-up: server check, routing, search, background Canvas refresh, service worker.
(() => {
"use strict";
const App = window.App, { $ } = App;

$("#feedbackLink").href = `mailto:${App.D.contact}?subject=${encodeURIComponent("Blue Jay Buddy feedback")}`;

/* Search: results replace the page while typing; clearing returns to the tab. */
let qT;
$("#q").addEventListener("input", () => { clearTimeout(qT); qT = setTimeout(App.render, 150); });
$("#searchForm").addEventListener("submit", e => { e.preventDefault(); App.render(); });
document.addEventListener("keydown", e => {
  if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); $("#q").focus(); }
});
window.addEventListener("hashchange", () => {
  if (/confirmation_token|recovery_token/.test(location.hash)) { App.render(); return; }
  $("#q").value = ""; App.render(); window.scrollTo({ top: 0, behavior: "auto" }); $("#main").focus({ preventScroll: true });
});

/* The GitHub Pages copy has no server. When the full version on Netlify is up, send visitors there. */
if (/github\.io$/.test(location.hostname) && App.D.api) {
  fetch(App.D.api + "/api/health").then(r => r.ok && r.json()).then(j => { if (j && j.ok) location.replace(App.D.api + "/" + location.hash); }).catch(() => {});
}

/* Is the Netlify server reachable? (Pages on GitHub only serve files.) */
async function checkServer(){
  try { const r = await App.api("/api/health"); App.S.hasServer = !!r.ok; App.S.ai = !!r.ai; App.S.sis = !!r.sis; }
  catch { App.S.hasServer = false; }
}

/* Keep Canvas fresh while the app is open; alerts are made on each refresh. */
async function refresh(){
  if (!App.canvas.feed && !App.canvas.token) { App.makeAlerts(); return; }
  if (Date.now() - (App.canvas.last || 0) > 20 * 6e4) { await App.syncCanvas(true); if (["today","classes"].includes(App.route().tab)) App.render(); }
  else App.makeAlerts();
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
setInterval(refresh, 10 * 6e4);

/* Service worker: offline support and push alerts. */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
  navigator.serviceWorker.addEventListener("message", e => { if (e.data?.type === "push") { App.inbox.add(e.data.alert); } });
}

const h = new Date().getHours();
document.body.dataset.sky = h >= 5 && h < 8 ? "dawn" : h < 17 && h >= 8 ? "day" : h < 20 && h >= 17 ? "dusk" : "night";
App.inbox.badge();
App.render();
checkServer().then(() => { refresh(); App.render(); });
})();

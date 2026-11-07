// Offline support and push alerts.
// When you change a file, bump VERSION here and the ?v= numbers in index.html so every browser loads the new copy together.
const VERSION = "bjb-v6";
const V = "?v=6";
const SHELL = ["./", "index.html", "styles.css" + V, "data.js" + V, "guides.js" + V, "illustrations.js" + V, "programs.js" + V, "food-data.js" + V,
  ...["core","import","canvas","today","classes","food","campus","groups","ask","setup","main"].map(f => `js/${f}.js${V}`),
  "manifest.webmanifest", "assets/icon.svg", "assets/icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first for our own files (so updates show up), cache as the fallback when offline. API calls are never cached.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/.netlify/")) return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});

// Push alerts from the server (deadlines due within 24 hours, even when the app is closed).
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data.json(); } catch { d = { title: "Blue Jay Buddy", body: e.data ? e.data.text() : "" }; }
  e.waitUntil((async () => {
    await self.registration.showNotification(d.title || "Blue Jay Buddy", { body: d.body || "", tag: d.tag, icon: "assets/icon-192.png", badge: "assets/icon-192.png", data: { url: d.url || "./#classes/due" } });
    const cs = await clients.matchAll({ type: "window" });
    cs.forEach(c => c.postMessage({ type: "push", alert: { id: d.tag || String(Date.now()), kind: d.kind || "due", title: d.title, body: d.body, url: d.link || "" } }));
  })());
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const target = e.notification.data?.url || "./";
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => x.url.includes(self.registration.scope));
    if (c) { c.focus(); return c.navigate ? c.navigate(target) : null; }
    return clients.openWindow(target);
  }));
});

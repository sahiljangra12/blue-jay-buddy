// Offline support: the app shell is cached so the hub opens without a connection.
// When you change a file, bump VERSION here and the ?v= numbers in index.html so every browser loads the new copy together.
const VERSION = "bjb-v12";
const V = "12"; // keep equal to the ?v= numbers in index.html
const SHELL = ["./", "index.html", "privacy.html", "manifest.webmanifest", "assets/icon.svg", "assets/icon-192.png", "assets/fonts/geist.woff2",
  ...["styles.css", "data.js", "guides.js", "photos.js", "hours.js", "canvas.js", "import.js", "live.js", "app.js", "tools.js"].map(f => `${f}?v=${V}`)];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first for our own files (so updates show up), cache as the fallback when offline.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, {cache: "no-cache"}).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});

// Deadline reminders sent by the server (see netlify/functions/push-check.mts).
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch { d = { title: e.data?.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Blue Jay Buddy", {
    body: d.body || "", tag: d.tag, icon: "assets/icon-192.png", badge: "assets/icon-192.png", data: { url: d.url || "./" },
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || "./", self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    const open = list.find(c => c.url.startsWith(self.registration.scope));
    return open ? open.focus().then(c => c.navigate(url)) : clients.openWindow(url);
  }));
});

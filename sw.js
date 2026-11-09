// Offline support: the app shell is cached so the hub opens without a connection.
// When you change a file, bump VERSION here and the ?v= numbers in index.html so every browser loads the new copy together.
const VERSION = "bjb-v7";
const SHELL = ["./", "index.html", "styles.css?v=7", "data.js?v=7", "guides.js?v=7", "illustrations.js?v=7", "hours.js?v=7", "canvas.js?v=7", "import.js?v=7", "app.js?v=7", "privacy.html", "manifest.webmanifest", "assets/icon.svg", "assets/icon-192.png", "assets/fonts/bricolage.woff2"];

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

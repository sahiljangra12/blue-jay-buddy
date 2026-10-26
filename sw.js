// Offline support: the app shell is cached so the hub opens without a connection.
// Bump VERSION whenever you change a file so phones pick up the new copy.
const VERSION = "bjb-v1";
const SHELL = ["./", "index.html", "styles.css", "data.js", "app.js", "manifest.webmanifest", "assets/icon.svg", "assets/icon-192.png", "assets/fonts/bricolage.woff2", "assets/fonts/plex-sans-400.woff2", "assets/fonts/plex-sans-500.woff2", "assets/fonts/plex-sans-600.woff2", "assets/fonts/plex-mono-500.woff2"];

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
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});

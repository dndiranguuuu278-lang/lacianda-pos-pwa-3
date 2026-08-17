// sw.js — App-shell cache-first service worker.
//
// This is the piece that makes "Install app" genuinely behave like a
// desktop app rather than a bookmark: after the first visit, every asset
// below is cached, so the app opens instantly with zero network — same as
// a native binary would — and all data itself already lives in IndexedDB
// (see js/db.js), which persists regardless of network state.

const CACHE_NAME = "lacianda-pos-v5";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/app.js",
  "./js/db.js",
  "./js/auth.js",
  "./js/money.js",
  "./js/seed-data.js",
  "./js/inventory.js",
  "./js/sales.js",
  "./js/reports.js",
  "./js/receipt.js",
  "./js/permissions.js",
  "./js/till-state.js",
  "./js/theme.js",
  "./js/etims.js",
  "./js/stk-push.js",
  "./js/screens/login.js",
  "./js/screens/till.js",
  "./js/screens/inventory-form.js",
  "./js/screens/inventory-list.js",
  "./js/screens/import.js",
  "./js/screens/settings.js",
  "./js/screens/reports.js",
  "./js/screens/sales-list.js",
  "./js/screens/etims-queue.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/favicon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // Opportunistically cache anything else same-origin we fetch later.
          if (response.ok && event.request.url.startsWith(self.location.origin)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // offline and not cached: nothing more we can do for this asset
    })
  );
});

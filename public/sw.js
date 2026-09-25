/* AuraShop service worker — app-shell cache for offline use and PWA installability.
   Static, versioned assets are cache-first; navigations are network-first so the
   dev server / live site never serves stale HTML. */
const CACHE = "aurashop-shell-v1";

const SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg",
  "/icon-180.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Navigations: network-first, falling back to the cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/index.html"))
        )
    );
    return;
  }

  // Static assets that are part of the app shell: cache-first.
  if (SHELL.includes(new URL(request.url).pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
  }
});

const CACHE_NAME = "book-tracker-v1";
const OFFLINE_FILES = [
  "/book-tracker/",
  "/book-tracker/index.html",
  "/book-tracker/css/style.css",
  "/book-tracker/js/app.js",
  "/book-tracker/manifest.json",
  "/book-tracker/icons/icon-192.png",
  "/book-tracker/icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_FILES))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

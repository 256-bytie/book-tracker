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

// Install event: cache files
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_FILES))
  );
});

// Activate event: clean up old caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

// Fetch event: serve cached files, fallback to network
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

// Update this version number whenever you make changes
const CACHE_VERSION = "v2.0.2";
const CACHE_NAME = `study-notes-${CACHE_VERSION}`;

const urlsToCache = ["/", "/index.html", "/styles.css", "/manifest.json"];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()), // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()), // Take control immediately
  );
});

// Fetch event - Network first, then cache (for fresh content)
self.addEventListener("fetch", (event) => {
  // Only handle http and https requests
  if (!event.request.url.startsWith("http")) {
    return;
  }

  // Never cache app.js - always fetch fresh to avoid stale code
  if (event.request.url.includes("/app.js")) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() => {
        return new Response("console.error('Failed to load app.js')", {
          headers: { "Content-Type": "application/javascript" },
        });
      }),
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (response.ok) {
          // Clone the response before caching
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      }),
  );
});

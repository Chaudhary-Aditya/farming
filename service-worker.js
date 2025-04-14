// Define the cache name
const CACHE_NAME = 'organic-farming-cache-v1';

// List of URLs (static assets and pages) to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/firstbajra.html',
  '/firstrice.html',
  '/firstsugarcane.html',
  '/firstwheat.html',
  '/offline.html', // fallback page when offline
  '/css/style.css', // Add any necessary CSS file(s)
  '/js/script.js' // Add your JS file(s) here
];

// Event 1: Install
// Triggered when the service worker is first registered or updated
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');

  // Cache all the necessary files during installation
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching essential files...');
      return cache.addAll(urlsToCache);
    })
  );

  // Force the service worker to take control immediately (skip waiting)
  self.skipWaiting();
});

// Event 2: Activate
// Cleans up any old caches from previous versions
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Delete old caches that don't match the current CACHE_NAME
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  self.clients.claim();
});

// Event 3: Fetch
// Intercepts all network requests and decides whether to use the cached version or fetch from the network
self.addEventListener('fetch', event => {
  const request = event.request;

  // Only handle GET requests (ignore POST, etc.)
  if (request.method !== 'GET') return;

  // If the request is for an HTML page, use the network-first strategy
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // If online, cache a copy of the page for future use
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          // If offline, try to return the cached version of the page
          return caches.match(request).then(cachedResponse => {
            // If not cached, return the offline fallback page
            return cachedResponse || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // For all other files (CSS, JS, images), use cache-first strategy
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // If found in cache, return it
      if (cachedResponse) {
        return cachedResponse;
      }

      // Else, fetch from the network and cache it
      return fetch(request).then(networkResponse => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseClone);
        });
        return networkResponse;
      });
    })
  );
});

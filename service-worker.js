// service-worker.js

const CACHE_NAME = 'organic-farming-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/firstbajra.html',
  '/firstrice.html',
  '/firstsugarcane.html',
  '/firstwheat.html',
  '/offline.html'

];

// Event 1: Install
// This is triggered when the service worker is first registered or updated
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');

  // Pre-cache all essential files during install
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching essential files...');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Activate service worker immediately without waiting for old one to close
  self.skipWaiting();
});

// Event 2: Activate
// This cleans up any old caches from previous versions
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Delete old caches that don't match current CACHE_NAME
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
// This intercepts every network request made by the site
self.addEventListener('fetch', event => {
  const request = event.request;

  // Only handle GET requests (ignore POST, etc.)
  if (request.method !== 'GET') return;

  // If the request is for an HTML page (text/html), use network-first
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // If online, cache a copy of the page for later use
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          // If offline, try to return the cached version of the page
          return caches.match(request).then(cachedResponse => {
            // If not in cache, return the offline fallback page
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

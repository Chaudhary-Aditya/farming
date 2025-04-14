// Define cache name
// service-worker.js

const CACHE_NAME = 'organic-farming-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/firstbajra.html',
  '/firstrice.html',
  '/firstsugarcane.html',
  '/firstwheat.html'

];

// INSTALL: Cache essential assets and pages
self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Installed');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('[ServiceWorker] Caching essential files');
      return cache.addAll(urlsToCache).catch(function(error) {
        console.error('[ServiceWorker] Error during caching:', error);
      });
    })
  );
});

// ACTIVATE: Clean up old caches
self.addEventListener('activate', function(event) {
  console.log('[ServiceWorker] Activated');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(name) {
          if (name !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).catch(function(error) {
      console.error('[ServiceWorker] Error during activation:', error);
    })
  );
});

// FETCH: Intercept requests and serve from cache if available
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // If there's a cached response, serve it
      if (response) {
        console.log('[ServiceWorker] Serving from cache:', event.request.url);
        return response;
      }

      // If not, fetch from the network and cache it for future use
      return fetch(event.request).then(function(networkResponse) {
        // Clone the response to prevent it from being consumed by the cache and the network at the same time
        const clonedResponse = networkResponse.clone();
        
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(function(cache) {
            console.log('[ServiceWorker] Caching new resource:', event.request.url);
            cache.put(event.request, clonedResponse);
          });
        }

        return networkResponse;
      }).catch(function(error) {
        // Fallback to a default response if fetch fails
        console.error('[ServiceWorker] Fetch failed:', error);
        return caches.match('/offline.html');
      });
    }).catch(function(error) {
      console.error('[ServiceWorker] Error in fetch handler:', error);
      return caches.match('/offline.html');
    })
  );
});

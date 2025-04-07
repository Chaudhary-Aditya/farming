// service-worker.js

const CACHE_NAME = 'organic-farming-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/th.jpg',
    '/crop-diversification-1140x535.jpg',
    '/alternative-farming-sustainable-nature-concept-1-1.jpg',
    '/pest.jpg',
    '/healthy.jpg',
    '/sugarcane11111.jpg',
    '/practices.jpg',
    '/plant-bio-organic-farm-logo-vector-17131460.jpg',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

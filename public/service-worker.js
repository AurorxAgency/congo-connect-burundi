// public/service-worker.js
const CACHE_NAME = 'congo-connect-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx', // Corrected path
  '/src/App.tsx',
  '/src/index.css',
  '/manifest.json',
  '/asset/icons/icon-192x192.png',
  '/asset/icons/icon-512x512.png',
  '/asset/icon-384x384.png',
  '/asset/Screenshot 2025-11-02 115011.png',
  '/asset/Screenshot.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

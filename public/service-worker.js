// public/service-worker.js
const CACHE_NAME = 'congo-connect-cache-v3';
const IMAGES_CACHE = 'congo-images-cache-v1';
const DATA_CACHE = 'congo-data-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/manifest.json',
  '/asset/icons/icon-192x192.png',
  '/asset/icons/icon-512x512.png',
  '/asset/icon-384x384.png',
  '/asset/Screenshot 2025-11-02 115011.png',
  '/asset/Screenshot.png'
];

// Installation - mise en cache des ressources statiques
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Stratégie de cache pour les images et photos
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache les images avec une stratégie Cache First
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGES_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            return response;
          }
          return fetch(request).then(networkResponse => {
            // Clone la réponse avant de la mettre en cache
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // Retourne une image par défaut en cas d'échec
            return new Response('Image non disponible', { status: 404 });
          });
        });
      })
    );
    return;
  }

  // Cache les données API avec stratégie Network First
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/storage/v1/')) {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache => {
        return fetch(request).then(networkResponse => {
          // Stocke la réponse fraîche dans le cache
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
          // En cas d'échec réseau, utilise le cache
          return cache.match(request).then(cachedResponse => {
            return cachedResponse || new Response('Données non disponibles hors ligne', { 
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        });
      })
    );
    return;
  }

  // Cache par défaut pour les autres ressources
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request);
    })
  );
});

// Background Sync - synchronisation des données en arrière-plan
self.addEventListener('sync', event => {
  console.log('Background sync démarré:', event.tag);
  
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
  
  if (event.tag === 'sync-images') {
    event.waitUntil(syncImages());
  }
});

// Fonction pour synchroniser les posts
async function syncPosts() {
  try {
    const cache = await caches.open(DATA_CACHE);
    // Logique de synchronisation des posts
    console.log('Posts synchronisés');
  } catch (error) {
    console.error('Erreur de synchronisation des posts:', error);
  }
}

// Fonction pour synchroniser les images
async function syncImages() {
  try {
    const cache = await caches.open(IMAGES_CACHE);
    // Logique de synchronisation des images
    console.log('Images synchronisées');
  } catch (error) {
    console.error('Erreur de synchronisation des images:', error);
  }
}

// Nettoyage des anciens caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, IMAGES_CACHE, DATA_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Suppression du cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Gestion des messages du client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_IMAGES') {
    event.waitUntil(
      caches.open(IMAGES_CACHE).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

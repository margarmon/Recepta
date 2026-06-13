const CACHE_NAME = 'cuinareel-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
];

// Instal·lació: guarda els assets estàtics a la caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching assets');
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => console.log('[SW] Pre-cache error:', err))
  );
  self.skipWaiting();
});

// Activació: esborra caches antigues
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first, fallback a caché
self.addEventListener('fetch', event => {
  // No interceptem crides a l'API d'Anthropic
  if (event.request.url.includes('anthropic.com')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guarda la resposta a la caché si és vàlida
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline: serveix des de caché
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback per a navegació
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

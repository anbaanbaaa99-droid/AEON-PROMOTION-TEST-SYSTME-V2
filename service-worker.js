const CACHE = 'aeon-promotion-test-v5-1';
const CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/icon.svg',
  'assets/css/style.css?v=5.1.0',
  'assets/js/api.js?v=5.1.0',
  'assets/js/app.js?v=5.1.0'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // config.js harus selalu fresh supaya URL Apps Script tidak tertahan cache lama.
  if (url.pathname.endsWith('/assets/js/config.js')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});

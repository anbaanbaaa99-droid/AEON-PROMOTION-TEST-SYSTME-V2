const CACHE = 'aeon-promotion-test-v5-4';
const CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/icon.svg',
  'assets/css/style.css?v=5.4.0',
  'assets/js/api.js?v=5.4.0',
  'assets/js/app.js?v=5.4.0'
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
  if (url.origin !== self.location.origin) return;

  // Endpoint/config harus selalu fresh agar deployment Apps Script terbaru terbaca.
  if (url.pathname.endsWith('/assets/js/config.js')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // PDF berukuran besar: jangan dimasukkan ke CacheStorage service worker.
  // Browser tetap boleh menggunakan HTTP cache normal saat user membukanya.
  if (url.pathname.includes('/assets/modules/') || url.pathname.endsWith('.pdf')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navigasi/HTML: network-first agar update UI cepat terlihat, fallback offline.
  if (event.request.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE).then(cache => cache.put('./index.html', copy)));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Aset UI kecil: cache-first, lalu isi cache bila belum ada.
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
        }
        return response;
      });
    })
  );
});

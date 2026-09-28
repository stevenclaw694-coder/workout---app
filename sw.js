// Offline support. App files: network first (so updates show up), cache fallback.
// Photos: cache first (they never change).
const SHELL = 'wk-shell-v2';
const IMGS = 'wk-img-v1';
const SHELL_FILES = [
  './', 'index.html', 'css/app.css', 'manifest.webmanifest',
  'js/app.js', 'js/data.js', 'js/store.js', 'js/sound.js', 'js/timer.js',
  'icons/icon-192.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => ![SHELL, IMGS].includes(k)).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  if (url.pathname.includes('/img/')) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(IMGS).then((c) => c.put(e.request, copy));
      return res;
    })));
    return;
  }

  e.respondWith(fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(SHELL).then((c) => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});

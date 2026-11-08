/* Tu acta de transparencia — primero busca la versión de internet; sin conexión, usa la copia guardada.
   Cambia VERSION cada vez que publiques cambios. */
const VERSION = 'tat-v8';
const CORE = ['./', './index.html', './chart.umd.min.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './emblema.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(CORE.map((u) =>
    fetch(new Request(u, { cache: 'reload' })).then((r) => { if (r.ok) return c.put(u, r); }).catch(() => {})
  ))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  e.respondWith(
    fetch(sameOrigin ? new Request(req, { cache: 'no-cache' }) : req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});

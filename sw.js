/* 雅思真经听读 offline cache. Bump happens automatically when any file changes. */
const VERSION = 'zj-main-243a24acb1';
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-v2-180.png", "./icon-v2-192.png", "./icon-v2-512.png", "./GentiumBookPlus-Regular.woff2", "./GentiumBookPlus-Bold.woff2", "./GentiumBookPlus-Italic.woff2", "./BarlowCondensed-SemiBold.woff2", "./BarlowCondensed-Bold.woff2", "./BarlowCondensed-BoldItalic.woff2", "./BarlowCondensed-ExtraBoldItalic.woff2"];
self.addEventListener('install', e => {
  /* cache: 'reload' skips the browser's HTTP cache, so the new version really is the new files */
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  /* only this copy's old caches: another copy of the app may live on the same site */
  const mine = k => k !== VERSION && (k.startsWith('zj-main-') || /^zhenjing-[0-9a-f]+$/.test(k));
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(mine).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    /* open instantly from the cache; refresh the cached page in the background when online */
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match('./index.html');
      const net = fetch(req.url, { cache: 'no-cache' }).then(res => { if (res && res.ok) { const copy = res.clone(); c.put('./index.html', copy); } return res; }).catch(() => null);
      return hit || (await net) || new Response('离线且尚未缓存，请联网打开一次。', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }));
    return;
  }
  e.respondWith(caches.open(VERSION).then(c => c.match(req)).then(hit => hit || fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  })));
});

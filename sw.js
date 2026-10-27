// Bump the version when changing cache behavior; asset query strings stay intact.
const CACHE_PREFIX = 'portfolio-cache-';
const ASSET_CACHE = `${CACHE_PREFIX}assets-v1`;
const PAGE_CACHE = `${CACHE_PREFIX}pages-v1`;
const PAGE_TIMEOUT = 800;
const scope = new URL(self.registration.scope);

const cacheFor = url => {
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return null;
  const file = url.pathname.slice(scope.pathname.length);
  if (file === '' || file === 'index.html' || file === 'project_description.html') return PAGE_CACHE;
  if (/^(css|js)\/.+\.(css|js)$/.test(file) ||
      /^assets\/(img|projects_img)\/.+\.(png|jpe?g|webp|svg|ico)$/i.test(file)) return ASSET_CACHE;
  return null;
};

const store = async (cacheName, request, response) => {
  // Never persist errors, redirects, private responses, or opaque third-party data.
  if (response.status !== 200 || response.type === 'opaque' || response.redirected ||
      /no-store|private/i.test(response.headers.get('Cache-Control') || '')) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  const keys = await cache.keys();
  const limit = cacheName === PAGE_CACHE ? 20 : 100;
  await Promise.all(keys.slice(0, Math.max(0, keys.length - limit)).map(key => cache.delete(key)));
};

const fetchAndStore = async (request, cacheName) => {
  const response = await fetch(request, {
    cache: request.cache === 'force-cache' ? 'force-cache' : 'no-cache'
  });
  try {
    await store(cacheName, request, response);
  } catch {
    // Storage/quota errors must not prevent the actual network response loading.
  }
  return response;
};

self.addEventListener('install', event => {
  // No bulk downloads: the first visit retains its normal network priorities.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) &&
      name !== ASSET_CACHE && name !== PAGE_CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  // Contact submissions, downloads, games, and external hosts remain untouched.
  if (request.method !== 'GET' || request.cache === 'no-store' || request.headers.has('Range')) return;
  const cacheName = cacheFor(new URL(request.url));
  if (!cacheName) return;

  const network = fetchAndStore(request, cacheName);
  event.waitUntil(network.catch(() => {}));
  event.respondWith((async () => {
    const cached = await caches.open(cacheName).then(cache => cache.match(request)).catch(() => null);
    if (!cached) return network;
    // Cached images/styles/scripts appear immediately; refresh in the background.
    if (cacheName === ASSET_CACHE) return cached;

    // Prefer current HTML, but don't let a slow connection block a repeat visit.
    let timer;
    try {
      return await Promise.race([
        network.then(response => response.ok ? response : cached).catch(() => cached),
        new Promise(resolve => { timer = setTimeout(() => resolve(cached), PAGE_TIMEOUT); })
      ]);
    } finally {
      clearTimeout(timer);
    }
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type !== 'CACHE_VISITED' || !Array.isArray(event.data.urls)) return;
  event.waitUntil(Promise.all(event.data.urls.slice(0, 64).map(async value => {
    try {
      const url = new URL(value);
      url.hash = '';
      const cacheName = cacheFor(url);
      if (!cacheName) return;
      const cache = await caches.open(cacheName);
      if (await cache.match(url.href)) return;
      // Reuse the HTTP cache from this visit instead of preloading unseen assets.
      const request = new Request(url.href, { cache: 'force-cache', credentials: 'same-origin' });
      await fetchAndStore(request, cacheName);
    } catch {
      // A failed resource can be fetched and cached normally on a later visit.
    }
  })));
});

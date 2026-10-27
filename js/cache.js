// Cache only resources this visitor has already loaded, after the initial render.
(() => {
  if (!('serviceWorker' in navigator)) return;

  const registerCache = async () => {
    try {
      await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type: 'CACHE_VISITED',
        urls: [...new Set([
          window.location.href,
          ...performance.getEntriesByType('resource').map(resource => resource.name)
        ])]
      });
    } catch {
      // Normal browser/HTTP caching still works if service workers are unavailable.
    }
  };

  if (document.readyState === 'complete') registerCache();
  else window.addEventListener('load', registerCache, { once: true });
})();

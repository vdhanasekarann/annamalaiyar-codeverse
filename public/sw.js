const SW_VERSION = "cv-sw-v4";
const PRECACHE_NAME = `${SW_VERSION}-precache`;
const RUNTIME_NAME = `${SW_VERSION}-runtime`;
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/offline.html",
  "/AICodeverse.png",
  "/icons/favicon-32x32.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

function isCacheableResponse(response) {
  return response && response.ok && response.type !== "error";
}

async function cacheResponse(cacheName, request, response) {
  if (!isCacheableResponse(response)) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

async function warmPrecache() {
  const cache = await caches.open(PRECACHE_NAME);
  await Promise.allSettled(
    APP_SHELL.map(async (url) => {
      try {
        const response = await fetch(url, { cache: "reload" });
        if (isCacheableResponse(response)) {
          await cache.put(url, response);
        }
      } catch {
        // Ignore failed entries so one bad path does not block install.
      }
    })
  );
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/logos/") ||
    pathname.startsWith("/bg/") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".woff2")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(warmPrecache());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== PRECACHE_NAME && key !== RUNTIME_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          await cacheResponse(RUNTIME_NAME, request, response);
          return response;
        })
        .catch(async () => {
          const cachedRoute = await caches.match(request);
          if (cachedRoute) return cachedRoute;
          const appShell = await caches.match("/index.html");
          if (appShell) return appShell;
          return caches.match("/offline.html");
        })
    );
    return;
  }

  if (!isStaticAsset(url.pathname)) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        event.waitUntil(
          fetch(request)
            .then((response) => cacheResponse(RUNTIME_NAME, request, response))
            .catch(() => undefined)
        );
        return cached;
      }

      try {
        const response = await fetch(request);
        await cacheResponse(RUNTIME_NAME, request, response);
        return response;
      } catch {
        return caches.match("/offline.html");
      }
    })()
  );
});

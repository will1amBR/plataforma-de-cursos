const CACHE_NAME = 'ronald-ead-v1'
const ASSETS_TO_CACHE = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE)
      })
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip API / PocketBase requests from strict cache
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('/api/')) {
    // Network first for API
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)))
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch new version in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse))
            }
          })
          .catch(() => {})
        return cachedResponse
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse
          }
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
          return networkResponse
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
        })
    }),
  )
})

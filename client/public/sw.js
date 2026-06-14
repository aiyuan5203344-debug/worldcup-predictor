const CACHE_NAME = 'worldcup-predictor-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/index.css',
  '/assets/index.js'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API requests (always go to network)
  if (event.request.url.includes('/api/')) return

  // Skip socket.io requests
  if (event.request.url.includes('/socket.io/')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone()

        // Cache successful responses
        if (response.ok) {
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone)
            })
        }

        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }

            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/')
            }

            return new Response('Offline', { status: 503 })
          })
      })
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}

  const title = data.title || '世界杯预测'
  const body = data.body || '有新的比赛更新'
  const icon = data.icon || '/icons/icon-192.png'
  const badge = data.badge || '/icons/icon-192.png'
  const data = data.data || {}

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data,
      actions: [
        { action: 'view', title: '查看' },
        { action: 'close', title: '关闭' }
      ]
    })
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/'

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus()
            }
          }

          // Open new window
          return clients.openWindow(url)
        })
    )
  }
})

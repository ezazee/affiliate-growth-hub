const CACHE_NAME = 'pe-skinpro-affiliate-v2';
const urlsToCache = [
  '/',
  '/login',
  '/register',
  '/admin',
  '/affiliator',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon/android-chrome-192x192.png',
  '/favicon/android-chrome-512x512.png',
  '/favicon/favicon-32x32.png',
  '/favicon/icon-192x192.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  console.log('📱 User Agent:', navigator.userAgent);
  console.log('🌐 Origin:', self.location.origin);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Install complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activate complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - Custom handler removed to allow Workbox to handle caching strategies
// or fallback to network for non-precached items.
self.addEventListener('fetch', (event) => {
  // Only handle if necessary or leave empty to let browser/Workbox handle it
});

// Push event - handle incoming push messages
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');

  if (!event.data) {
    console.log('Service Worker: Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Default notification message',
      icon: '/favicon/android-chrome-192x192.png',
      badge: '/favicon/favicon-32x32.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
        url: data.url || '/affiliator'
      },
      actions: [
        {
          action: 'explore',
          title: 'Lihat Detail',
          icon: '/favicon/favicon-32x32.png'
        },
        {
          action: 'close',
          title: 'Tutup',
          icon: '/favicon/favicon-32x32.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'PE Skinpro', options)
    );
  } catch (error) {
    console.error('Service Worker: Error processing push notification:', error);
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');

  event.notification.close();

  if (event.action === 'explore' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window if no existing window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/affiliator');
        }
      })
    );
  }
});

// Push subscription change event
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Service Worker: Push subscription changed');

  // This event is called when the subscription expires or is invalidated
  if (event.oldSubscription) {
    // Remove old subscription from server
    event.waitUntil(
      fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: event.oldSubscription.endpoint
        })
      })
    );
  }

  if (event.newSubscription) {
    // Add new subscription to server
    event.waitUntil(
      fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event.newSubscription.toJSON())
      })
    );
  }
});

// Message event for manual refresh
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'FORCE_UPDATE') {
    // Force update cache
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('Service Worker: Cache cleared for update');
      })
    );
  }

  if (event.data && event.data.type === 'ANDROID_SETUP') {
    console.log('📱 Android setup message received:', event.data);

    // Android-specific setup
    event.waitUntil(
      self.registration.pushManager.getSubscription()
        .then(subscription => {
          if (subscription) {
            console.log('✅ Android: Found existing subscription');
            return subscription;
          } else {
            console.log('ℹ️ Android: No existing subscription found');
            return null;
          }
        })
        .catch(err => {
          console.error('❌ Android: Subscription check failed:', err);
        })
    );
  }
});

// Helper function to convert base64 string to Uint8Array
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
// importScripts(
//   "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js"
// );
importScripts("./ngsw-worker.js");

self.addEventListener("install", (event) => {
  console.log("Service worker installed");
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
});

self.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    console.log('APP resumed');
    window.location.reload();
  }
});

self.addEventListener('push', (event) => {
  const title = 'Yay a message.';
  const options = {
    body: 'We have received a push message.',
    icon: 'images/icon.png',
    badge: 'images/badge.png'
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
})

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });

self.addEventListener('fetch', event => {
  event.respondWith(async function() {
    const cachedResponse = await caches.match(event.request);

    if (cachedResponse) {
      const fetchedOn = parseInt(cachedResponse.headers.get('sw-fetched-on'));
      const cacheDuration = 1000 * 60;// * 60 * 24; // e.g., 24 hours in milliseconds
      console.log('cache duration ', cacheDuration);

      if (Date.now() - fetchedOn < cacheDuration) {
        // Cache is still fresh, return it
        return cachedResponse;
      } else {
        // Cache is stale, fetch from network and update cache
        caches.delete('main-app');
        try {
          const networkResponse = await fetch(event.request);
          await cacheAndStoreTimestamp(event.request, networkResponse);
          return networkResponse;
        } catch (error) {
          // Network failed, fallback to stale cache
          return cachedResponse;
        }
      }
    }

    // No cached response, fetch from network
    try {
      const networkResponse = await fetch(event.request);
      await cacheAndStoreTimestamp(event.request, networkResponse);
      return networkResponse;
    } catch (error) {
      // Network failed and no cache, handle offline
      return new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
    }
  }());
});

const CACHE_NAME = "ut-udc-apnp-field_contact-cache-v1";

async function cacheAndStoreTimestamp(request, response) {
  const clonedResponse = response.clone();
  const headers = new Headers(clonedResponse.headers);
  headers.set('sw-fetched-on', Date.now()); // Store the timestamp
  const newResponse = new Response(clonedResponse.body, {
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
    headers: headers
  });
  const cache = await caches.open('main-app');
  console.log('main-app is open');
  await cache.put(request, newResponse);
  return newResponse;
}

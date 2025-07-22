importScripts('./ngsw-worker.js');
// import { registerRoute } from 'workbox-routing';
// import { NetworkFirst } from 'workbox-strategies';
// import { ExpirationPlugin } from 'workbox-expiration';
// import {StaleWhileRevalidate} from 'workbox-strategies';

// registerRoute(
//   ({url}) => url.pathname.startsWith('/'),
//   new StaleWhileRevalidate()
// );

self.addEventListener('install', (event) => {
  console.log('Service worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
});

self.addEventListener('fetch', (event) => {
  respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

const CACHE_NAME = 'sup-contact-cache-v1';
const urlsToCache = [
    './index.html',
    './styles.scss',
    './offline.html',
    './favicon.ico',
    './icons/*',
    './assets/icons/*',
    './assets/images/*',
    './assets/data/*'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

  self.addEventListener('fetch', event => {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request)
          .then(response => {
            return response || caches.match('/offline.html');
          }))
    );
  });
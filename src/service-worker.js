/* eslint-disable no-restricted-globals */

// This service worker is processed by CRA's workbox-webpack-plugin at build time.
// It precaches all static assets and handles runtime caching for APIs, images, and fonts.

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Take control of all pages immediately
clientsClaim();

// Precache all webpack-generated assets (injected by workbox-webpack-plugin)
precacheAndRoute(self.__WB_MANIFEST);

// -------------------------------------------------------------------
// App Shell: navigate requests → serve cached index.html
// -------------------------------------------------------------------
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') return false;
    if (url.pathname.startsWith('/_')) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// -------------------------------------------------------------------
// Images – Cache First (long-lived)
// -------------------------------------------------------------------
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// -------------------------------------------------------------------
// API calls – Network First (fresh data with offline fallback)
// -------------------------------------------------------------------
registerRoute(
  ({ url }) => url.pathname.includes('/api/'),
  new NetworkFirst({
    cacheName: 'api-responses',
    networkTimeoutSeconds: 8,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 10 * 60, // 10 minutes
      }),
    ],
  })
);

// -------------------------------------------------------------------
// Fonts – Cache First (very long-lived, versioned via URL hash)
// -------------------------------------------------------------------
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 15,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// -------------------------------------------------------------------
// CSS & JS – Stale While Revalidate (fast loads, background update)
// -------------------------------------------------------------------
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// -------------------------------------------------------------------
// Allow the client to trigger skipWaiting via postMessage
// -------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

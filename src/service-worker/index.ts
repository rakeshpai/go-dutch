/// <reference lib="WebWorker" />
import '../test.css';

declare const self: ServiceWorkerGlobalScope;

const buildAssets = ['##SW_ASSETS##'];

console.log('Service Worker Loaded', buildAssets);

self.addEventListener('activate', async () => {
  console.log('Service Worker Activated');
  await self.clients.claim();
});

self.addEventListener('sync', e => {
  console.log('Service Worker Sync', e);
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  console.log('Service Worker Fetch', e, buildAssets);
  e.respondWith(fetch(e.request));
});

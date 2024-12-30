/// <reference lib="webworker" />
import '../test.css';

declare const self: ServiceWorkerGlobalScope;

const buildAssets = ['##SW_ASSETS##'];

console.log('Service Worker Loaded', buildAssets);

self.addEventListener('activate', async () => {
  console.log('Service Worker Activated');
  await self.clients.claim();
});

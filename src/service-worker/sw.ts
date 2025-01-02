/// <reference lib="WebWorker" />
import { handle } from 'hono/service-worker';
import createApp from './routes';
import { addToCache, cleanUpCache } from './utils/request-cache';

declare const self: ServiceWorkerGlobalScope;

const buildAssets = ['##SW_ASSETS##'];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      await addToCache(buildAssets);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', async event => {
  event.waitUntil(
    Promise.all([self.clients.claim(), cleanUpCache(buildAssets)]),
  );
});

const app = createApp(buildAssets);

self.addEventListener('fetch', handle(app));

/// <reference lib="WebWorker" />
import { handle } from 'hono/service-worker';
import { addAssetsToCache, cleanUpCache } from './utils/request-cache';
import { setBuildAssets } from './utils/build-assets';
import app from './routes';

declare const self: ServiceWorkerGlobalScope;

setBuildAssets(['##SW_ASSETS##']);

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      await addAssetsToCache();
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', async event => {
  event.waitUntil(Promise.all([self.clients.claim(), cleanUpCache()]));
});

self.addEventListener('fetch', handle(app));

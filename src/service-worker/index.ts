/// <reference lib="WebWorker" />
import { handle } from 'hono/service-worker';
import '../app.css';
import createApp from './routes';
import { addToCache, cleanUpCache } from './utils/request-cache';

declare const self: ServiceWorkerGlobalScope;

const buildAssets = ['##SW_ASSETS##'];

const log = (...args: unknown[]) => {
  console.log('sw:', ...args);
};

log('Service Worker Loaded', buildAssets);

self.addEventListener('install', event => {
  log('Service Worker Activated');

  event.waitUntil(
    (async () => {
      await addToCache(buildAssets);
      await self.skipWaiting();
    })(),
  );
  // await self.clients.claim();
});

self.addEventListener('sync', e => {
  log('Service Worker Sync', e);
});

self.addEventListener('activate', async event => {
  event.waitUntil(
    Promise.all([self.clients.claim(), cleanUpCache(buildAssets)]),
  );
});

const app = createApp(buildAssets);

self.addEventListener('fetch', handle(app));

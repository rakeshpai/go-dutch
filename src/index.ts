navigator.serviceWorker.register(
  new URL(/* @vite-ignore */ './##SW_PATH##', import.meta.url),
  { scope: '/', type: 'module' },
);

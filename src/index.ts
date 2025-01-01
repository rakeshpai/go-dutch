import swScript from './service-worker/sw?worker&url';

const registration = await navigator.serviceWorker.register(swScript, {
  scope: '/',
  type: 'module',
});

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', () => {
    // registration.update();
    console.log('beforefullreload', registration);
  });
}

export default {};

import swScript from './service-worker/sw?worker&url';

const init = async () => {
  const registration = await navigator.serviceWorker.register(swScript, {
    scope: '/',
    type: 'module',
  });

  setInterval(
    () => {
      registration.update();
    },
    1000 * 60 * 60,
  );

  navigator.serviceWorker.oncontrollerchange = () => {
    window.location.reload();
  };
};

init();

export default {};

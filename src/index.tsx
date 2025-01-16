import { initialize as initializeContactPicker } from './service-worker/components/ContactPicker.client';
import { init as initializeDialog } from './lib/dialog';
import swScript from './service-worker/sw?worker&url';

const initSw = async () => {
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

const initComponents = () => {
  initializeContactPicker();
};

const initHTMLComponents = () => {
  initializeDialog();
};

initSw();
initComponents();
initHTMLComponents();

export default {};

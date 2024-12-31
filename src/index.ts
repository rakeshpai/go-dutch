import { register } from 'register-service-worker';

register(
  new URL(/* @vite-ignore */ './##SW_PATH##', import.meta.url).toString(),
  {
    registrationOptions: { scope: '/', type: 'module' },
    updated() {
      // TODO: Handle cursor position, scroll position, form state, etc.
      window.location.reload();
    },
  },
);

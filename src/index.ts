import { register } from 'register-service-worker';
import swScript from './service-worker/index?worker&url';

register(swScript, {
  registrationOptions: { scope: '/', type: 'module' },
  updated() {
    // TODO: Handle cursor position, scroll position, form state, etc.
    // window.location.reload();
  },
  ready() {
    // registration.
  },
});

export default {};

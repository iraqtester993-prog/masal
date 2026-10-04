import './runtime/vue.js';
import './runtime/styles.js';
import './runtime/units.js';
import './js/app.js';
import { createApp } from 'vue';
import App from './App.vue';

window.app = createApp(App)
  .directive('money', globalThis.MasalMoneyInputs.directive)
  .mount('#mount-root');

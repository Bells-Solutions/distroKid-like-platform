import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createAuth0 } from '@auth0/auth0-vue';
import { createPinia } from 'pinia';
import { router } from './router/index';

const app = createApp(App);
const pinia = createPinia();

app.use(
  createAuth0({
    domain: import.meta.env.VITE_AUTH0_DOMAIN as string,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID as string,
    authorizationParams: { redirect_uri: window.location.origin },
  })
);

app.use(router);
app.use(pinia);
app.mount('#app');

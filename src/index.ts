import { initializeClient } from 'striv-rts-client';
import { initializeServer } from './app';

(async () => {
  initializeClient({
    host: process.env.REDIS_ENDPOINT
  });

  await initializeServer(8080);
})();

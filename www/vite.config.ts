import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, new URL('.', import.meta.url).pathname);
  return {
    plugins: [TanStackRouterVite({ target: 'react', autoCodeSplitting: true }), react()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    server: {
      port: 5000,
      // Reachable from outside the container when started with docker compose.
      host: true,
      // Same-origin calls in development: the dev server forwards /api/* to the API.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET ?? 'http://localhost:5001',
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});

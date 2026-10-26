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
      // The API has no CORS yet: the dev server forwards /api/* to it.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000',
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});

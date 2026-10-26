import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    setupFiles: ['./test/e2e/support/env.setup.ts'],
    // All e2e files share the same database.
    fileParallelism: false,
    hookTimeout: 30_000,
  },
});

import { existsSync } from 'node:fs';

// e2e tests run against their own database (see docker/postgres-init).
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}
process.env.DB_NAME = process.env.DB_NAME_TEST ?? 'upwind_board_test';
process.env.DB_LOGGING = 'false';

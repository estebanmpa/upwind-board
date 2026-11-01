import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from '../../config/database.config.js';
import { validateEnv } from '../../config/env.validation.js';

// Entry point for the TypeORM CLI (migrations). The Nest app builds its own
// connection from the same options through ConfigService.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export default new DataSource(buildDataSourceOptions(validateEnv(process.env)));

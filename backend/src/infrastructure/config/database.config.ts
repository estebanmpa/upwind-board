import { DataSourceOptions } from 'typeorm';
import { EnvironmentVariables } from './env.validation.js';
import { TYPEORM_ENTITIES } from '../persistence/type-orm/entities/index.js';
import { TYPEORM_MIGRATIONS } from '../persistence/type-orm/migrations/index.js';

export function buildDataSourceOptions(
  env: Pick<
    EnvironmentVariables,
    | 'DB_HOST'
    | 'DB_PORT'
    | 'DB_USERNAME'
    | 'DB_PASSWORD'
    | 'DB_NAME'
    | 'DB_LOGGING'
  >,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    logging: env.DB_LOGGING,
    entities: TYPEORM_ENTITIES,
    migrations: TYPEORM_MIGRATIONS,
    // Schema changes always go through migrations.
    synchronize: false,
    migrationsRun: false,
    // gen_random_uuid() is built into PostgreSQL 13+, no extension needed.
    uuidExtension: 'pgcrypto',
  };
}

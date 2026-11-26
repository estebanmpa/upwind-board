import { Inject, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { CacheService } from '../../domain/services/cache.service.js';
import { LockService } from '../../domain/services/lock.service.js';
import { EnvironmentService } from '../services/environment.service.js';
import { RedisCacheService } from './redis-cache.service.js';
import { RedisLockService } from './redis-lock.service.js';
import {
  createRedisClient,
  REDIS_CLIENT,
  type RedisClient,
} from './redis-client.js';

@Module({
  providers: [
    EnvironmentService,
    {
      provide: REDIS_CLIENT,
      inject: [EnvironmentService],
      useFactory: async (env: EnvironmentService): Promise<RedisClient> => {
        const logger = new Logger('Redis');
        const client = createRedisClient(env.redisUrl);
        client.on('error', (error: Error) =>
          logger.error(`Redis connection error: ${error.message}`),
        );
        await client.connect();
        return client;
      },
    },
    { provide: CacheService, useClass: RedisCacheService },
    { provide: LockService, useClass: RedisLockService },
  ],
  exports: [CacheService, LockService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClient) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.client.isOpen) await this.client.close();
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { CacheService } from '../../domain/services/cache.service.js';
import { REDIS_CLIENT, type RedisClient } from './redis-client.js';

/** Values are stored as JSON, so they come back as plain objects. */
@Injectable()
export class RedisCacheService extends CacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClient) {
    super();
  }

  async get<T>(key: string): Promise<T | undefined> {
    const raw = await this.client.get(key);
    return raw === null ? undefined : (JSON.parse(raw) as T);
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), {
      expiration: { type: 'PX', value: Math.ceil(ttlMs) },
    });
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async getKeys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }
}

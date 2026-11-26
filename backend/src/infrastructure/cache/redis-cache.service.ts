import { Inject, Injectable } from '@nestjs/common';
import { CacheService } from '../../domain/services/cache.service.js';
import { REDIS_CLIENT, type RedisClient } from './redis-client.js';

// Keys requested per SCAN round-trip. It is only a hint to Redis.
const SCAN_COUNT = 100;

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

  /**
   * Uses SCAN instead of KEYS: KEYS walks the whole keyspace in one call and
   * blocks Redis while it runs. SCAN may return a key more than once, so the
   * result is deduped.
   */
  async getKeys(pattern: string): Promise<string[]> {
    const keys = new Set<string>();
    for await (const batch of this.client.scanIterator({
      MATCH: pattern,
      COUNT: SCAN_COUNT,
    })) {
      for (const key of batch) keys.add(key);
    }
    return [...keys];
  }
}

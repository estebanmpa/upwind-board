import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { LockService } from '../../domain/services/lock.service.js';
import { REDIS_CLIENT, type RedisClient } from './redis-client.js';

// Deletes the key only if it still holds our token, so an expired lock that
// another instance re-acquired is never released by mistake.
const RELEASE_IF_OWNER = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0`;

@Injectable()
export class RedisLockService extends LockService {
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClient) {
    super();
  }

  async tryAcquire(key: string, ttlMs: number): Promise<string | undefined> {
    const ownershipToken = randomUUID();
    const result = await this.client.set(this.lockKey(key), ownershipToken, {
      condition: 'NX',
      expiration: { type: 'PX', value: ttlMs },
    });
    return result === 'OK' ? ownershipToken : undefined;
  }

  async release(key: string, ownershipToken: string): Promise<void> {
    await this.client.eval(RELEASE_IF_OWNER, {
      keys: [this.lockKey(key)],
      arguments: [ownershipToken],
    });
  }

  private lockKey(key: string): string {
    return `lock:${key}`;
  }
}

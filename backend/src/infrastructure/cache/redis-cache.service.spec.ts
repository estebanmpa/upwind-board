import { describe, expect, it, vi } from 'vitest';
import type { RedisClient } from './redis-client.js';
import { RedisCacheService } from './redis-cache.service.js';

async function* batches(...items: string[][]): AsyncGenerator<string[]> {
  for (const item of items) yield await Promise.resolve(item);
}

describe('RedisCacheService.getKeys', () => {
  it('collects every SCAN batch and dedupes repeated keys', async () => {
    const scanIterator = vi.fn(() =>
      batches(['session:a', 'session:b'], ['session:b', 'session:c'], []),
    );
    const service = new RedisCacheService({
      scanIterator,
    } as unknown as RedisClient);

    const keys = await service.getKeys('session:*');

    expect(keys.sort()).toEqual(['session:a', 'session:b', 'session:c']);
    expect(scanIterator).toHaveBeenCalledWith({
      MATCH: 'session:*',
      COUNT: 100,
    });
  });
});

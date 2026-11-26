export const CACHE_TTL = {
  ONE_DAY: 24 * 60 * 60 * 1000,
};

/** Key-value store shared by every backend instance. TTLs are in milliseconds. */
export abstract class CacheService {
  abstract get<T>(key: string): Promise<T | undefined>;
  abstract set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  abstract del(key: string): Promise<void>;
  abstract getKeys(pattern: string): Promise<string[]>;
}

import { vi } from 'vitest';
import type { CacheService } from '../../domain/services/cache.service.js';
import type { EnvironmentService } from '../../infrastructure/services/environment.service.js';
import type { Session } from '../domain/entities/session.js';

export const CLIENT_ID = 'upwind-board';

export function fakeEnvironment(
  overrides: Partial<EnvironmentService> = {},
): EnvironmentService {
  return {
    production: false,
    iamBaseUrl: 'http://iam-backend-container:3001',
    clientId: CLIENT_ID,
    clientSecret: 'secret',
    callbackUrl: 'http://localhost:5000/callback',
    redisUrl: 'redis://localhost:6379',
    ...overrides,
  } as EnvironmentService;
}

/** In-memory CacheService that records TTLs. */
export function fakeCache() {
  const store = new Map<string, unknown>();
  const ttls = new Map<string, number>();
  const cache = {
    get: vi.fn((key: string) =>
      Promise.resolve(structuredClone(store.get(key))),
    ),
    set: vi.fn((key: string, value: unknown, ttl: number) => {
      store.set(key, structuredClone(value));
      ttls.set(key, ttl);
      return Promise.resolve();
    }),
    del: vi.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
    getKeys: vi.fn((pattern: string) => {
      const regex = new RegExp(
        `^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`,
      );
      return Promise.resolve([...store.keys()].filter((k) => regex.test(k)));
    }),
  };
  return { cache: cache as unknown as CacheService, mocks: cache, store, ttls };
}

/** An unsigned JWT whose payload only carries `exp` (epoch seconds). */
export function tokenExpiringAt(epochMs: number): string {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(epochMs / 1000) })}.sig`;
}

export function buildSession(overrides: Partial<Session> = {}): Session {
  const now = Date.now();
  return {
    id: 'session-1',
    userId: 'user-1',
    iamUserId: 'iam-1',
    email: 'ana@example.com',
    displayName: 'Ana',
    permissions: { [CLIENT_ID]: { allow: ['*'], deny: [] } },
    accessToken: 'access-old',
    refreshToken: 'refresh-old',
    accessTokenExpiresAt: now + 10 * 60 * 1000,
    refreshTokenExpiresAt: now + 24 * 60 * 60 * 1000,
    ...overrides,
  };
}

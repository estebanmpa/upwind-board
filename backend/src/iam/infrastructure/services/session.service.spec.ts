import { describe, expect, it } from 'vitest';
import type { HashService } from '../../../domain/services/hash.service.js';
import type { RequestDataService } from '../../../domain/services/request-data.service.js';
import {
  fakeCache,
  fakeEnvironment,
  tokenExpiringAt,
} from '../../test/fakes.js';
import { InvalidIamTokenException } from '../../domain/exceptions/auth.domain-exception.js';
import type { SessionData } from '../../domain/services/session.service.js';
import { CacheSessionService } from './session.service.js';

const HOUR = 60 * 60 * 1000;

function setup(production = false) {
  const cache = fakeCache();
  let next = 0;
  const service = new CacheSessionService(
    { randomBytes: () => `session-${++next}` } as HashService,
    fakeEnvironment({ production }),
    cache.cache,
    {} as RequestDataService,
    { cookiePrefix: 'upwind-board', userSyncService: class {} as never },
  );
  return { service, ...cache };
}

function sessionData(overrides: Partial<SessionData> = {}): SessionData {
  return {
    userId: 'user-1',
    iamUserId: 'iam-1',
    email: 'ana@example.com',
    displayName: 'Ana',
    permissions: { 'upwind-board': { allow: ['*'], deny: [] } },
    accessToken: tokenExpiringAt(Date.now() + 0.25 * HOUR),
    refreshToken: tokenExpiringAt(Date.now() + 24 * HOUR),
    ...overrides,
  };
}

describe('CacheSessionService', () => {
  it('keeps the session and cookie for the refresh token lifetime', async () => {
    const { service, ttls } = setup();
    const cookie = await service.createOrRefreshSession(sessionData());

    const ttl = ttls.get('session:session-1')!;
    expect(ttl).toBeGreaterThan(23.9 * HOUR);
    expect(ttls.get('session:user-1:session-1')).toBe(ttl);
    expect(cookie).toMatchObject({
      name: 'upwind-board.session.insecure',
      value: 'session-1',
      options: { httpOnly: true, secure: false, sameSite: 'lax', maxAge: ttl },
    });
  });

  it('uses a secure cross-site cookie in production', async () => {
    const { service } = setup(true);
    const cookie = await service.createOrRefreshSession(sessionData());
    expect(cookie.name).toBe('upwind-board.session.secure');
    expect(cookie.options).toMatchObject({ secure: true, sameSite: 'none' });
  });

  it("prefers the lifetimes returned by IAM over the tokens' exp claims", async () => {
    const { service } = setup();
    await service.createOrRefreshSession(
      sessionData({ expiresIn: 60, refreshExpiresIn: 2 * 3600 }),
    );
    const session = (await service.getSession('session-1'))!;
    expect(session.accessTokenExpiresAt - Date.now()).toBeLessThanOrEqual(
      60_000,
    );
    expect(session.refreshTokenExpiresAt - Date.now()).toBeGreaterThan(
      1.9 * HOUR,
    );
  });

  it("reuses the user's existing session on a new login", async () => {
    const { service } = setup();
    await service.createOrRefreshSession(sessionData());
    const cookie = await service.createOrRefreshSession(
      sessionData({ displayName: 'Ana María' }),
    );
    expect(cookie.value).toBe('session-1');
    expect((await service.getSession('session-1'))!.displayName).toBe(
      'Ana María',
    );
  });

  it('stores renewed tokens and profile on the same session', async () => {
    const { service } = setup();
    await service.createOrRefreshSession(sessionData());
    await service.renewSessionTokens(
      'session-1',
      {
        accessToken: 'access-new',
        refreshToken: 'refresh-new',
        expiresIn: 900,
        refreshExpiresIn: 86400,
      },
      { email: 'ana@example.com', displayName: 'Ana', permissions: {} },
    );
    const session = (await service.getSession('session-1'))!;
    expect(session).toMatchObject({
      accessToken: 'access-new',
      refreshToken: 'refresh-new',
      permissions: {},
    });
  });

  it('deletes both cache keys', async () => {
    const { service, store } = setup();
    await service.createOrRefreshSession(sessionData());
    await service.deleteSession('session-1');
    expect(store.size).toBe(0);
  });

  it('refuses to create a session from an expired refresh token', async () => {
    const { service } = setup();
    await expect(
      service.createOrRefreshSession(
        sessionData({ refreshToken: tokenExpiringAt(Date.now() - 1_000) }),
      ),
    ).rejects.toThrow(InvalidIamTokenException);
  });
});

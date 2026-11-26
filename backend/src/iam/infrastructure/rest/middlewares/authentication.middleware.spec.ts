import { UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import type { RequestDataService } from '../../../../domain/services/request-data.service.js';
import { buildSession } from '../../../test/fakes.js';
import type { RenewSessionUseCase } from '../../../application/use-cases/renew-session.use-case.js';
import type { SessionService } from '../../../domain/services/session.service.js';
import { AuthenticationMiddleware } from './authentication.middleware.js';

const COOKIE = 'upwind-board.session.insecure';

function setup(stored = buildSession()) {
  const requestData = { set: vi.fn(), get: vi.fn() };
  const renew = { execute: vi.fn().mockResolvedValue({ session: stored }) };
  const middleware = new AuthenticationMiddleware(
    {
      getCookieName: () => COOKIE,
      getSession: vi.fn().mockResolvedValue(stored),
    } as unknown as SessionService,
    requestData as unknown as RequestDataService,
    renew as unknown as RenewSessionUseCase,
    {
      cookiePrefix: 'upwind-board',
      userSyncService: class {} as never,
      publicPathPrefixes: ['/docs'],
    },
  );
  const run = (url: string, cookies: Record<string, string> = {}) => {
    const res = { cookie: vi.fn() };
    const next = vi.fn();
    const promise = middleware.use(
      { originalUrl: url, cookies } as unknown as Request,
      res as unknown as Response,
      next,
    );
    return { promise, res, next };
  };
  return { run, requestData, renew };
}

describe('AuthenticationMiddleware', () => {
  it("lets IAM's own login endpoints and public prefixes through", async () => {
    const { run } = setup();
    for (const url of [
      '/auth/authorize',
      '/auth/token?x=1',
      '/docs/swagger-ui.css',
    ]) {
      const { promise, next } = run(url);
      await promise;
      expect(next).toHaveBeenCalled();
    }
  });

  it('rejects other paths without a session cookie', async () => {
    const { run } = setup();
    await expect(run('/students').promise).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(run('/auth/userinfo').promise).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('sets the renewed cookie and exposes the renewed session', async () => {
    const { run, renew, requestData } = setup();
    const renewed = buildSession({ accessToken: 'access-new' });
    const cookie = { name: COOKIE, value: 'session-1', options: { maxAge: 1 } };
    renew.execute.mockResolvedValue({ session: renewed, cookie });

    const { promise, res, next } = run('/students', { [COOKIE]: 'session-1' });
    await promise;

    expect(res.cookie).toHaveBeenCalledWith(COOKIE, 'session-1', { maxAge: 1 });
    expect(requestData.set).toHaveBeenCalledWith('session', renewed);
    expect(next).toHaveBeenCalled();
  });
});

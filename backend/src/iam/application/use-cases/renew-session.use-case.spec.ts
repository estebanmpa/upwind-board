import { describe, expect, it, vi } from 'vitest';
import type { LockService } from '../../../domain/services/lock.service.js';
import { buildSession, fakeEnvironment } from '../../test/fakes.js';
import type { Session } from '../../domain/entities/session.js';
import {
  IdentityProviderUnavailableException,
  SessionNotFoundException,
  UnauthorizedException,
} from '../../domain/exceptions/auth.domain-exception.js';
import type { IdentityProviderRepository } from '../../domain/repositories/identity-provider.repository.js';
import type { SessionService } from '../../domain/services/session.service.js';
import { RenewSessionUseCase } from './renew-session.use-case.js';

const expired = () =>
  buildSession({ accessTokenExpiresAt: Date.now() - 1_000 });
const renewed = () =>
  buildSession({
    accessToken: 'access-new',
    accessTokenExpiresAt: Date.now() + 10 * 60 * 1000,
    permissions: { 'upwind-board': { allow: ['read'], deny: [] } },
  });

function setup({
  stored = [expired(), renewed()] as (Session | undefined)[],
  lockToken = 'lock-1' as string | null,
  refreshToken = vi.fn().mockResolvedValue({
    accessToken: 'access-new',
    refreshToken: 'refresh-new',
    expiresIn: 600,
  }),
} = {}) {
  const getSession = vi.fn();
  for (const value of stored) getSession.mockResolvedValueOnce(value);
  getSession.mockResolvedValue(stored.at(-1));

  const sessions = {
    getSession,
    deleteSession: vi.fn().mockResolvedValue(undefined),
    renewSessionTokens: vi
      .fn()
      .mockResolvedValue({ name: 'c', value: 'session-1', options: {} }),
  };
  const iam = {
    refreshToken,
    userInfo: vi.fn().mockResolvedValue({
      userId: 'iam-1',
      email: 'ana@example.com',
      displayName: 'Ana',
      permissions: { 'upwind-board': { allow: ['read'], deny: [] } },
    }),
  };
  const lock = {
    tryAcquire: vi.fn().mockResolvedValue(lockToken ?? undefined),
    release: vi.fn().mockResolvedValue(undefined),
  };
  const useCase = new RenewSessionUseCase(
    sessions as unknown as SessionService,
    iam as unknown as IdentityProviderRepository,
    lock as unknown as LockService,
    fakeEnvironment(),
  );
  return { useCase, sessions, iam, lock };
}

describe('RenewSessionUseCase', () => {
  it('leaves a session with a valid access token untouched', async () => {
    const { useCase, iam, lock } = setup();
    const session = buildSession();
    await expect(useCase.execute(session)).resolves.toEqual({ session });
    expect(lock.tryAcquire).not.toHaveBeenCalled();
    expect(iam.refreshToken).not.toHaveBeenCalled();
  });

  it('renews an expired access token and refreshes permissions', async () => {
    const { useCase, sessions, iam, lock } = setup();
    const result = await useCase.execute(expired());

    expect(iam.refreshToken).toHaveBeenCalledWith(
      expect.objectContaining({
        grantType: 'refresh_token',
        refreshToken: 'refresh-old',
      }),
    );
    expect(sessions.renewSessionTokens).toHaveBeenCalledWith(
      'session-1',
      expect.objectContaining({ accessToken: 'access-new' }),
      expect.objectContaining({
        permissions: { 'upwind-board': { allow: ['read'], deny: [] } },
      }),
    );
    expect(result.session.accessToken).toBe('access-new');
    expect(result.cookie).toBeDefined();
    expect(lock.release).toHaveBeenCalledWith(
      'session-renewal:session-1',
      'lock-1',
    );
  });

  it('skips renewal when another request renewed while acquiring the lock', async () => {
    const { useCase, iam } = setup({ stored: [renewed()] });
    const result = await useCase.execute(expired());
    expect(iam.refreshToken).not.toHaveBeenCalled();
    expect(result.cookie).toBeUndefined();
  });

  it('ends the session when IAM rejects the refresh token', async () => {
    const { useCase, sessions, lock } = setup({
      refreshToken: vi.fn().mockRejectedValue(new UnauthorizedException()),
    });
    await expect(useCase.execute(expired())).rejects.toThrow(
      SessionNotFoundException,
    );
    expect(sessions.deleteSession).toHaveBeenCalledWith('session-1');
    expect(lock.release).toHaveBeenCalled();
  });

  it('keeps the session when IAM is unavailable', async () => {
    const { useCase, sessions } = setup({
      refreshToken: vi
        .fn()
        .mockRejectedValue(new IdentityProviderUnavailableException()),
    });
    await expect(useCase.execute(expired())).rejects.toThrow(
      IdentityProviderUnavailableException,
    );
    expect(sessions.deleteSession).not.toHaveBeenCalled();
  });

  it('waits for a concurrent renewal instead of renewing twice', async () => {
    const { useCase, iam } = setup({
      lockToken: null,
      stored: [expired(), renewed()],
    });
    const result = await useCase.execute(expired());
    expect(iam.refreshToken).not.toHaveBeenCalled();
    expect(result.session.accessToken).toBe('access-new');
  });

  it('fails when the concurrent renewal ended the session', async () => {
    const { useCase } = setup({ lockToken: null, stored: [undefined] });
    await expect(useCase.execute(expired())).rejects.toThrow(
      SessionNotFoundException,
    );
  });
});

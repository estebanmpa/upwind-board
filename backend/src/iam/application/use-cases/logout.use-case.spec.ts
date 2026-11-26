import { describe, expect, it, vi } from 'vitest';
import type { LoggerService } from '../../../domain/services/logger.service.js';
import { buildSession } from '../../test/fakes.js';
import {
  IdentityProviderUnavailableException,
  UnauthorizedException,
} from '../../domain/exceptions/auth.domain-exception.js';
import type { IdentityProviderRepository } from '../../domain/repositories/identity-provider.repository.js';
import type { SessionService } from '../../domain/services/session.service.js';
import { LogoutUseCase } from './logout.use-case.js';

function setup(
  session = buildSession(),
  logout = vi.fn().mockResolvedValue(undefined),
) {
  const sessions = {
    getSession: vi.fn().mockResolvedValue(session),
    deleteSession: vi.fn().mockResolvedValue(undefined),
  };
  const logger = { warn: vi.fn(), info: vi.fn(), error: vi.fn() };
  const useCase = new LogoutUseCase(
    sessions as unknown as SessionService,
    { logout } as unknown as IdentityProviderRepository,
    logger as unknown as LoggerService,
  );
  return { useCase, sessions, logout };
}

describe('LogoutUseCase', () => {
  it('deletes the local session and logs out from IAM', async () => {
    const { useCase, sessions, logout } = setup();
    await useCase.execute('session-1');
    expect(sessions.deleteSession).toHaveBeenCalledWith('session-1');
    expect(logout).toHaveBeenCalledWith('access-old');
  });

  it('does nothing without a session id or with an expired session', async () => {
    const { useCase, sessions, logout } = setup();
    await useCase.execute(undefined);
    sessions.getSession.mockResolvedValue(undefined);
    await useCase.execute('gone');
    expect(sessions.deleteSession).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
  });

  it('succeeds when IAM rejects the token or is down', async () => {
    for (const error of [
      new UnauthorizedException(),
      new IdentityProviderUnavailableException(),
    ]) {
      const { useCase } = setup(
        buildSession(),
        vi.fn().mockRejectedValue(error),
      );
      await expect(useCase.execute('session-1')).resolves.toBeUndefined();
    }
  });

  it('propagates unexpected errors', async () => {
    const { useCase } = setup(
      buildSession(),
      vi.fn().mockRejectedValue(new Error('boom')),
    );
    await expect(useCase.execute('session-1')).rejects.toThrow('boom');
  });
});

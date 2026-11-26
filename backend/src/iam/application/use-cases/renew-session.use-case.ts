import { Injectable } from '@nestjs/common';
import { LockService } from '../../../domain/services/lock.service.js';
import { EnvironmentService } from '../../../infrastructure/services/environment.service.js';
import { Cookie } from '../../domain/entities/cookie.js';
import type { Session } from '../../domain/entities/session.js';
import {
  IdentityProviderUnavailableException,
  SessionNotFoundException,
  UnauthorizedException,
} from '../../domain/exceptions/auth.domain-exception.js';
import { IdentityProviderRepository } from '../../domain/repositories/identity-provider.repository.js';
import {
  IssuedTokens,
  SessionService,
} from '../../domain/services/session.service.js';
import { IamRefreshTokenRequestDto } from '../dto/iam-refresh-token-request.js';

// Renew slightly early so a request never reaches IAM with an expired token.
const RENEWAL_MARGIN_MS = 15 * 1000;
const LOCK_TTL_MS = 10 * 1000;
const WAIT_INTERVAL_MS = 100;
const MAX_WAIT_MS = 5 * 1000;

export interface RenewedSession {
  session: Session;
  // Present only when this call renewed the session and the cookie changed.
  cookie?: Cookie;
}

/**
 * Renews the IAM tokens of a session whose access token expired, using the
 * refresh token. Concurrent requests of the same session share one renewal:
 * IAM rotates refresh tokens, so a second renewal with the old one would fail.
 */
@Injectable()
export class RenewSessionUseCase {
  constructor(
    private readonly sessionService: SessionService,
    private readonly identityProvider: IdentityProviderRepository,
    private readonly lockService: LockService,
    private readonly environment: EnvironmentService,
  ) {}

  async execute(session: Session): Promise<RenewedSession> {
    if (!this.needsRenewal(session)) return { session };

    const lockKey = `session-renewal:${session.id}`;
    const ownershipToken = await this.lockService.tryAcquire(
      lockKey,
      LOCK_TTL_MS,
    );
    if (!ownershipToken) return this.waitForRenewal(session.id);

    try {
      return await this.renewIfStillNeeded(session.id);
    } finally {
      await this.lockService.release(lockKey, ownershipToken);
    }
  }

  // Another instance may have renewed it between our read and the lock.
  private async renewIfStillNeeded(sessionId: string): Promise<RenewedSession> {
    const current = await this.getSessionOrFail(sessionId);
    if (!this.needsRenewal(current)) return { session: current };

    const tokens = await this.requestNewTokens(current);
    const profile = await this.identityProvider.userInfo(tokens.accessToken);
    const cookie = await this.sessionService.renewSessionTokens(
      sessionId,
      tokens,
      {
        email: profile.email,
        displayName: profile.displayName,
        permissions: profile.permissions,
      },
    );
    if (!cookie) throw new SessionNotFoundException('Session expired');

    return { session: await this.getSessionOrFail(sessionId), cookie };
  }

  private async requestNewTokens(session: Session): Promise<IssuedTokens> {
    const request = new IamRefreshTokenRequestDto(
      'refresh_token',
      session.refreshToken,
      this.environment.clientId,
      this.environment.clientSecret,
    );

    try {
      return await this.identityProvider.refreshToken(request);
    } catch (error) {
      if (!this.isRejectedByIdentityProvider(error)) throw error;
      // IAM ended the session (logout, revocation, expiry): end ours too.
      await this.sessionService.deleteSession(session.id);
      throw new SessionNotFoundException('Session expired');
    }
  }

  private async waitForRenewal(sessionId: string): Promise<RenewedSession> {
    const deadline = Date.now() + MAX_WAIT_MS;

    while (Date.now() < deadline) {
      await sleep(WAIT_INTERVAL_MS);
      const current = await this.getSessionOrFail(sessionId);
      if (!this.needsRenewal(current)) return { session: current };
    }
    throw new IdentityProviderUnavailableException('Session renewal timed out');
  }

  private async getSessionOrFail(sessionId: string): Promise<Session> {
    const session = await this.sessionService.getSession(sessionId);
    if (!session) throw new SessionNotFoundException('Session expired');
    return session;
  }

  // Sessions without a known expiration (NaN) are renewed too.
  private needsRenewal(session: Session): boolean {
    const remainingMs = session.accessTokenExpiresAt - Date.now();
    return !(remainingMs > RENEWAL_MARGIN_MS);
  }

  private isRejectedByIdentityProvider(error: unknown): boolean {
    return (
      error instanceof UnauthorizedException ||
      error instanceof SessionNotFoundException
    );
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../domain/services/logger.service.js';
import {
  IdentityProviderUnavailableException,
  SessionNotFoundException,
  UnauthorizedException,
} from '../../domain/exceptions/auth.domain-exception.js';
import { IdentityProviderRepository } from '../../domain/repositories/identity-provider.repository.js';
import { SessionService } from '../../domain/services/session.service.js';

/**
 * Idempotent: logging out an expired or unknown session succeeds, so the
 * client can always clear its state.
 */
@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly sessionService: SessionService,
    private readonly identityProvider: IdentityProviderRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(sessionId?: string): Promise<void> {
    if (!sessionId) return;

    const session = await this.sessionService.getSession(sessionId);
    if (!session) return;

    await this.sessionService.deleteSession(sessionId);
    await this.logoutFromIdentityProvider(session.accessToken);
  }

  // The local session is already gone; IAM rejecting an expired token
  // or being down must not turn a successful logout into an error.
  private async logoutFromIdentityProvider(accessToken: string): Promise<void> {
    try {
      await this.identityProvider.logout(accessToken);
    } catch (error) {
      if (!this.isIgnorableLogoutError(error)) throw error;
      this.logger.warn('IAM logout skipped', { reason: error.message });
    }
  }

  private isIgnorableLogoutError(error: unknown): error is Error {
    return (
      error instanceof UnauthorizedException ||
      error instanceof SessionNotFoundException ||
      error instanceof IdentityProviderUnavailableException
    );
  }
}

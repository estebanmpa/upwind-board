import { Inject, Injectable } from '@nestjs/common';
import { CacheService } from '../../../domain/services/cache.service.js';
import { HashService } from '../../../domain/services/hash.service.js';
import { RequestDataService } from '../../../domain/services/request-data.service.js';
import { EnvironmentService } from '../../../infrastructure/services/environment.service.js';
import { Cookie } from '../../domain/entities/cookie.js';
import type { Session } from '../../domain/entities/session.js';
import {
  IssuedTokens,
  SessionData,
  SessionProfile,
  SessionService,
} from '../../domain/services/session.service.js';
import {
  getRemainingLifetimeMs,
  getTokenExpiresAt,
} from '../../domain/services/token-lifetime.js';
import { IAM_OPTIONS, type IamModuleOptions } from '../../iam.options.js';

/** Sessions live in the shared cache; the browser only holds their id. */
@Injectable()
export class CacheSessionService extends SessionService {
  constructor(
    private readonly hashService: HashService,
    private readonly environment: EnvironmentService,
    private readonly cache: CacheService,
    private readonly requestData: RequestDataService,
    @Inject(IAM_OPTIONS) private readonly options: IamModuleOptions,
  ) {
    super();
  }

  async createOrRefreshSession(data: SessionData): Promise<Cookie> {
    const sessionData = {
      userId: data.userId,
      iamUserId: data.iamUserId,
      ...this.toProfileFields(data),
      ...this.toTokenFields(data),
    };
    const currentSessionId = await this.getSessionIdByUserId(data.userId);

    if (currentSessionId) {
      // Refresh with the new profile so permissions, names and tokens update.
      const refreshedCookie = await this.refreshSession(
        currentSessionId,
        sessionData,
      );
      if (refreshedCookie) return refreshedCookie;
    }

    return this.createSession(sessionData);
  }

  getSession(sessionId: string): Promise<Session | undefined> {
    return this.cache.get<Session>(this.sessionKey(sessionId));
  }

  async refreshSession(
    sessionId: string,
    newData?: Partial<Session>,
  ): Promise<Cookie | undefined> {
    const existing = await this.cache.get<Session>(this.sessionKey(sessionId));
    if (!existing) return undefined;

    return this.storeSession({ ...existing, ...newData });
  }

  renewSessionTokens(
    sessionId: string,
    tokens: IssuedTokens,
    profile: SessionProfile,
  ): Promise<Cookie | undefined> {
    return this.refreshSession(sessionId, {
      ...this.toProfileFields(profile),
      ...this.toTokenFields(tokens),
    });
  }

  getCookieName(): string {
    const suffix = this.environment.production ? 'secure' : 'insecure';
    return `${this.options.cookiePrefix}.session.${suffix}`;
  }

  getCurrentSession(): Promise<Session> {
    return Promise.resolve(this.requestData.get<Session>('session'));
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.cache.get<Session>(this.sessionKey(sessionId));
    if (!session) return;

    await Promise.all([
      this.cache.del(this.sessionWithUserKey(session.userId, session.id)),
      this.cache.del(this.sessionKey(sessionId)),
    ]);
  }

  private createSession(data: Omit<Session, 'id'>): Promise<Cookie> {
    return this.storeSession({ id: this.hashService.randomBytes(), ...data });
  }

  // The session lives as long as its refresh token; the access token is
  // renewed with it whenever it expires.
  private async storeSession(session: Session): Promise<Cookie> {
    const ttl = getRemainingLifetimeMs(session.refreshTokenExpiresAt);

    await Promise.all([
      this.cache.set(this.sessionKey(session.id), session, ttl),
      this.cache.set(
        this.sessionWithUserKey(session.userId, session.id),
        session,
        ttl,
      ),
    ]);

    return this.buildCookie(session.id, ttl);
  }

  private toTokenFields(tokens: IssuedTokens) {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: getTokenExpiresAt(
        tokens.accessToken,
        tokens.expiresIn,
      ),
      refreshTokenExpiresAt: getTokenExpiresAt(
        tokens.refreshToken,
        tokens.refreshExpiresIn,
      ),
    };
  }

  private toProfileFields(profile: SessionProfile): SessionProfile {
    return {
      email: profile.email,
      displayName: profile.displayName,
      permissions: profile.permissions,
    };
  }

  private buildCookie(sessionId: string, maxAge: number): Cookie {
    const production = this.environment.production;
    return new Cookie(this.getCookieName(), sessionId, {
      httpOnly: true,
      secure: production,
      sameSite: production ? 'none' : 'lax',
      maxAge,
    });
  }

  private async getSessionIdByUserId(
    userId: string,
  ): Promise<string | undefined> {
    const keys = await this.cache.getKeys(`session:${userId}:*`);
    if (keys.length === 0) return undefined;

    // "session:userId:sessionId" -> the last segment is the id
    const parts = keys[0].split(':');
    return parts[parts.length - 1];
  }

  private sessionKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  private sessionWithUserKey(userId: string, sessionId: string): string {
    return `session:${userId}:${sessionId}`;
  }
}

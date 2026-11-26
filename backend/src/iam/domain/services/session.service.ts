import { Cookie } from '../entities/cookie.js';
import { PlainPermissions } from '../entities/plain-permissions.js';
import type { Session } from '../entities/session.js';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  // Lifetimes in seconds as returned by IAM, when available.
  expiresIn?: number;
  refreshExpiresIn?: number;
}

export interface SessionProfile {
  email: string;
  displayName: string;
  permissions: PlainPermissions;
}

export interface SessionData extends IssuedTokens, SessionProfile {
  userId: string;
  iamUserId: string;
}

export abstract class SessionService {
  abstract createOrRefreshSession(data: SessionData): Promise<Cookie>;
  abstract renewSessionTokens(
    sessionId: string,
    tokens: IssuedTokens,
    profile: SessionProfile,
  ): Promise<Cookie | undefined>;
  abstract refreshSession(sessionId: string): Promise<Cookie | undefined>;
  abstract getCookieName(): string;
  abstract getSession(sessionId: string): Promise<Session | undefined>;
  abstract getCurrentSession(): Promise<Session>;
  abstract deleteSession(sessionId: string): Promise<void>;
}

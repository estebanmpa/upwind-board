import { PlainPermissions } from './plain-permissions.js';

/** Stored as JSON in the shared cache, keyed by its id. */
export interface Session {
  id: string;
  userId: string;
  iamUserId: string;
  email: string;
  displayName: string;
  permissions: PlainPermissions;
  accessToken: string;
  refreshToken: string;
  // Epoch milliseconds; past this, the access token must be renewed.
  accessTokenExpiresAt: number;
  // Epoch milliseconds; the session ends with the refresh token.
  refreshTokenExpiresAt: number;
}

import { InvalidIamTokenException } from '../exceptions/auth.domain-exception.js';

// Below this, the session would expire before the user could do anything.
const MIN_LIFETIME_MS = 30 * 1000;

/**
 * Epoch milliseconds when an IAM token (access or refresh) expires. Prefers
 * the lifetime IAM returns and falls back to the token's `exp` claim.
 */
export function getTokenExpiresAt(
  token: string,
  expiresInSeconds?: number,
  now: number = Date.now(),
): number {
  if (
    typeof expiresInSeconds === 'number' &&
    Number.isFinite(expiresInSeconds)
  ) {
    return now + expiresInSeconds * 1000;
  }
  return readExpirationSeconds(token) * 1000;
}

export function getRemainingLifetimeMs(
  expiresAt: number,
  now: number = Date.now(),
): number {
  const lifetimeMs = expiresAt - now;
  if (!Number.isFinite(lifetimeMs) || lifetimeMs < MIN_LIFETIME_MS) {
    throw new InvalidIamTokenException(
      'IAM token is expired or about to expire',
    );
  }
  return lifetimeMs;
}

/**
 * The signature is not verified: the token comes straight from IAM over a
 * backend-to-backend call, so the channel already guarantees its origin.
 */
function readExpirationSeconds(token: string): number {
  const [, payload] = (token ?? '').split('.');
  try {
    const { exp } = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as { exp?: unknown };
    if (typeof exp === 'number' && Number.isFinite(exp)) return exp;
  } catch {
    // Malformed token: handled below with a domain error.
  }
  throw new InvalidIamTokenException();
}

import { describe, expect, it } from 'vitest';
import { tokenExpiringAt } from '../../test/fakes.js';
import { InvalidIamTokenException } from '../exceptions/auth.domain-exception.js';
import { getRemainingLifetimeMs, getTokenExpiresAt } from './token-lifetime.js';

const NOW = 1_800_000_000_000;

describe('getTokenExpiresAt', () => {
  it('prefers expiresIn returned by IAM', () => {
    expect(getTokenExpiresAt(tokenExpiringAt(NOW + 5_000), 600, NOW)).toBe(
      NOW + 600_000,
    );
  });

  it("falls back to the token's exp claim", () => {
    expect(
      getTokenExpiresAt(tokenExpiringAt(NOW + 60_000), undefined, NOW),
    ).toBe(NOW + 60_000);
  });

  it('rejects a malformed token when IAM sends no expiresIn', () => {
    expect(() => getTokenExpiresAt('not-a-jwt')).toThrow(
      InvalidIamTokenException,
    );
  });
});

describe('getRemainingLifetimeMs', () => {
  it('returns the time left until expiration', () => {
    expect(getRemainingLifetimeMs(NOW + 120_000, NOW)).toBe(120_000);
  });

  it('rejects an expiration that has passed or is imminent', () => {
    expect(() => getRemainingLifetimeMs(NOW + 1_000, NOW)).toThrow(
      InvalidIamTokenException,
    );
    expect(() => getRemainingLifetimeMs(Number.NaN, NOW)).toThrow(
      InvalidIamTokenException,
    );
  });
});

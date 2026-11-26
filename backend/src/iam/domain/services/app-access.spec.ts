import { describe, expect, it } from 'vitest';
import { grantsAccessTo } from './app-access.js';

describe('grantsAccessTo', () => {
  it('requires at least one allowed action on the resource', () => {
    expect(grantsAccessTo({ app: { allow: ['read'], deny: [] } }, 'app')).toBe(
      true,
    );
    expect(grantsAccessTo({ app: { allow: [], deny: [] } }, 'app')).toBe(false);
    expect(grantsAccessTo({ other: { allow: ['*'], deny: [] } }, 'app')).toBe(
      false,
    );
    expect(grantsAccessTo(undefined, 'app')).toBe(false);
  });

  it('denies everything when the resource denies "*"', () => {
    expect(grantsAccessTo({ app: { allow: ['*'], deny: ['*'] } }, 'app')).toBe(
      false,
    );
  });
});

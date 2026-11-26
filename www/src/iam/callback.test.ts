import { describe, expect, it } from 'vitest';
import { afterStateMismatch, consumeState, resolveCallback } from './callback';

describe('resolveCallback', () => {
  it('exchanges the code when the state matches', () => {
    expect(resolveCallback({ code: 'c1', state: 's1' }, 's1')).toEqual({
      kind: 'exchange',
      code: 'c1',
    });
  });

  it('rejects a state that does not match the stored one', () => {
    expect(resolveCallback({ code: 'c1', state: 'forged' }, 's1')).toEqual({
      kind: 'state-mismatch',
    });
    expect(resolveCallback({ code: 'c1', state: 's1' }, null)).toEqual({
      kind: 'state-mismatch',
    });
  });

  it('rejects a code that comes without any state', () => {
    expect(resolveCallback({ code: 'c1' }, 's1')).toEqual({ kind: 'state-mismatch' });
  });

  it('explains an IAM access denial', () => {
    expect(resolveCallback({ error: 'access_denied', state: 's1' }, 's1')).toEqual({
      kind: 'error',
      message: 'Your account has no access to Upwind Board.',
    });
  });

  it('reports a response without a code', () => {
    expect(resolveCallback({ state: 's1' }, 's1').kind).toBe('error');
  });
});

describe('consumeState', () => {
  const storageWith = (stored: string | null) => {
    let value = stored;
    return {
      get: () => value,
      remove: () => {
        value = null;
      },
    };
  };

  it('forgets the state of the login that just came back', () => {
    const storage = storageWith('s1');
    consumeState('s1', storage);
    expect(storage.get()).toBeNull();
  });

  it('keeps the state of a login started meanwhile in another window', () => {
    const storage = storageWith('s2');
    consumeState('s1', storage);
    expect(storage.get()).toBe('s2');
  });

  it('keeps the stored state when the response carries none', () => {
    const storage = storageWith('s1');
    consumeState(undefined, storage);
    expect(storage.get()).toBe('s1');
  });
});

describe('afterStateMismatch', () => {
  it('lets a signed-in user continue instead of logging them out', () => {
    expect(afterStateMismatch(true)).toBe('continue');
  });

  it('shows the error to a user without a session', () => {
    expect(afterStateMismatch(false)).toBe('show-error');
  });
});

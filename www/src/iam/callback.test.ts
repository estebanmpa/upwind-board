import { describe, expect, it } from 'vitest';
import { resolveCallback } from './callback';

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

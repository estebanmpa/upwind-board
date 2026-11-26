/** Query string parameters the IAM appends to the callback URL. */
export interface CallbackSearch {
  code?: string;
  state?: string;
  error?: string;
}

export type CallbackOutcome =
  | { kind: 'exchange'; code: string }
  | { kind: 'error'; message: string }
  | { kind: 'state-mismatch' };

const IAM_ERRORS: Record<string, string> = {
  access_denied: 'Your account has no access to Upwind Board.',
};

/**
 * Decides what the callback page does. The returned state must match the
 * one stored before leaving for the IAM, or the response may be forged (CSRF).
 */
export function resolveCallback(
  search: CallbackSearch,
  storedState: string | null,
): CallbackOutcome {
  if (search.state !== undefined && search.state !== storedState) {
    return { kind: 'state-mismatch' };
  }
  if (search.error) {
    return { kind: 'error', message: IAM_ERRORS[search.error] ?? search.error };
  }
  if (!search.code) {
    return { kind: 'error', message: 'The sign-in response has no authorization code.' };
  }
  if (!search.state) return { kind: 'state-mismatch' };
  return { kind: 'exchange', code: search.code };
}

/**
 * Forgets the state of a login once its response arrived, so the same
 * callback URL (reloaded, restored by the browser) cannot be processed again.
 * Only this login's state is removed: if another window of the app started a
 * login meanwhile, the stored state is now that one and must survive.
 */
export function consumeState(
  returnedState: string | undefined,
  storage: { get(key: 'state'): string | null; remove(key: 'state'): void },
): void {
  if (returnedState && storage.get('state') === returnedState) {
    storage.remove('state');
  }
}

/**
 * What a callback whose state does not match does. Nothing is logged out:
 * not exchanging the code already stops a forged response, while logging out
 * would end the user's session on every device and app sharing it. A user
 * who already has a session simply continues in the app.
 */
export function afterStateMismatch(isAuthenticated: boolean): 'continue' | 'show-error' {
  return isAuthenticated ? 'continue' : 'show-error';
}

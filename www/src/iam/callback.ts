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

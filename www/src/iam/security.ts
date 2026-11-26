type Key = 'user' | 'state';

const PREFIX = 'upwind-board.iam.';

/**
 * Login state kept in the browser. Storage can be unavailable (private mode,
 * blocked site data), so every access is guarded.
 */
export const Security = {
  set(key: Key, value: string): void {
    try {
      localStorage.setItem(PREFIX + key, value);
    } catch {
      // Without storage the user simply signs in again next time.
    }
  },

  get(key: Key): string | null {
    try {
      return localStorage.getItem(PREFIX + key);
    } catch {
      return null;
    }
  },

  remove(key: Key): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // Nothing to remove.
    }
  },

  /** Full storage key, to recognize changes made by other windows. */
  storageKey(key: Key): string {
    return PREFIX + key;
  },
};

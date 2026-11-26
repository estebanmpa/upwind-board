import { PlainPermissions } from '../entities/plain-permissions.js';

/**
 * Whether the IAM grants the user anything at all on the application, so
 * the UI can tell "no access to this app" apart from a missing permission.
 */
export const grantsAccessTo = (
  permissions: PlainPermissions | undefined,
  resource: string,
): boolean => {
  const actions = permissions?.[resource];
  return !!actions && actions.allow.length > 0 && !actions.deny.includes('*');
};

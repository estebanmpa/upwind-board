export interface PermissionActions {
  allow: string[];
  deny: string[];
}

/**
 * Permissions granted by the IAM, keyed by resource. An application's
 * resource is its client id.
 */
export type PlainPermissions = Record<string, PermissionActions>;

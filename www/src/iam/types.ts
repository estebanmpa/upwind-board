/** Actions granted per IAM resource (an application's resource is its client id). */
export type PlainPermissions = Record<string, { allow: string[]; deny: string[] }>;

/** What the backend tells the browser about its session (never the IAM tokens). */
export interface UserSession {
  email: string;
  displayName: string;
  permissions: PlainPermissions;
  /** False when the IAM grants this account nothing on this application. */
  hasAccess: boolean;
}

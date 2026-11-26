import { SetMetadata } from '@nestjs/common';

export interface RequiredPermission {
  /**
   * IAM resource the action belongs to. Defaults to this application's own
   * resource, which the IAM names after its client id (IAM_CLIENT_ID).
   */
  resource?: string;
  action: string;
}

export const PERMISSIONS_KEY = 'required_permissions';

export const RequirePermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

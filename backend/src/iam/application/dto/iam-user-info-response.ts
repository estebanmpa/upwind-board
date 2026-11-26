import { PlainPermissions } from '../../domain/entities/plain-permissions.js';

/** Response of the IAM userinfo endpoint. */
export class IamUserInfoResponseDto {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly permissions: PlainPermissions,
  ) {}
}

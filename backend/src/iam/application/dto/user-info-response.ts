import { PlainPermissions } from '../../domain/entities/plain-permissions.js';
import type { Session } from '../../domain/entities/session.js';
import { grantsAccessTo } from '../../domain/services/app-access.js';

// What the browser may know about its session: never the IAM tokens.
export class UserInfoResponseDto {
  constructor(
    public readonly email: string,
    public readonly displayName: string,
    public readonly permissions: PlainPermissions,
    public readonly hasAccess: boolean,
  ) {}

  /** `resource` is this application's IAM resource (its client id). */
  static fromSession(
    session: Pick<Session, 'email' | 'displayName' | 'permissions'>,
    resource: string,
  ): UserInfoResponseDto {
    return new UserInfoResponseDto(
      session.email,
      session.displayName,
      session.permissions,
      grantsAccessTo(session.permissions, resource),
    );
  }
}

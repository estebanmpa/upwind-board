import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Provider,
  Scope,
} from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { RequestDataService } from '../../../../domain/services/request-data.service.js';
import { EnvironmentService } from '../../../../infrastructure/services/environment.service.js';
import type { Session } from '../../../domain/entities/session.js';
import {
  PERMISSIONS_KEY,
  RequiredPermission,
} from '../decorators/require-permissions.decorator.js';

/** Enforces @RequirePermissions with the permissions stored in the session. */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly requestData: RequestDataService,
    private readonly environment: EnvironmentService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<
      RequiredPermission[] | undefined
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    if (!required || required.length === 0) return true;

    const session = this.requestData.get<Session | undefined>('session');
    if (!session) throw new ForbiddenException();

    for (const { action, resource = this.environment.clientId } of required) {
      const perms = session.permissions?.[resource];
      const isDenied =
        perms?.deny?.includes('*') || perms?.deny?.includes(action);
      const isAllowed =
        !isDenied &&
        (perms?.allow?.includes('*') || perms?.allow?.includes(action));

      if (!isAllowed) {
        throw new ForbiddenException(
          `Permission denied: ${action} on ${resource}`,
        );
      }
    }
    return true;
  }
}

export const permissionsGuardProvider: Provider = {
  provide: APP_GUARD,
  useClass: PermissionsGuard,
  // Nest takes a global guard's scope from here, not from its dependencies.
  scope: Scope.REQUEST,
};

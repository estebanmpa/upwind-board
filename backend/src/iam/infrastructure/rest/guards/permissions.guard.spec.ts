import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';
import type { RequestDataService } from '../../../../domain/services/request-data.service.js';
import { buildSession, fakeEnvironment } from '../../../test/fakes.js';
import type { PlainPermissions } from '../../../domain/entities/plain-permissions.js';
import {
  PERMISSIONS_KEY,
  type RequiredPermission,
} from '../decorators/require-permissions.decorator.js';
import { PermissionsGuard } from './permissions.guard.js';

function check(
  required: RequiredPermission[] | undefined,
  permissions?: PlainPermissions,
) {
  const handler = () => undefined;
  if (required) Reflect.defineMetadata(PERMISSIONS_KEY, required, handler);
  const session = permissions ? buildSession({ permissions }) : undefined;
  const guard = new PermissionsGuard(
    new Reflector(),
    { get: () => session } as unknown as RequestDataService,
    fakeEnvironment(),
  );
  const context = {
    getHandler: () => handler,
    getClass: () => class {},
  } as unknown as ExecutionContext;
  return () => guard.canActivate(context);
}

describe('PermissionsGuard', () => {
  it('ignores routes without required permissions', () => {
    expect(check(undefined)()).toBe(true);
  });

  it("checks the application's own resource when none is given", () => {
    const required = [{ action: 'lessons:write' }];
    expect(
      check(required, {
        'upwind-board': { allow: ['lessons:write'], deny: [] },
      })(),
    ).toBe(true);
    expect(check(required, { other: { allow: ['*'], deny: [] } })).toThrow(
      ForbiddenException,
    );
  });

  it('checks an explicit resource when one is given', () => {
    const required = [{ resource: 'billing', action: 'read' }];
    expect(check(required, { billing: { allow: ['*'], deny: [] } })()).toBe(
      true,
    );
  });

  it('gives deny precedence over allow', () => {
    const required = [{ action: 'lessons:write' }];
    expect(
      check(required, {
        'upwind-board': { allow: ['*'], deny: ['lessons:write'] },
      }),
    ).toThrow(ForbiddenException);
  });

  it('rejects a request without a session', () => {
    expect(check([{ action: 'read' }])).toThrow(ForbiddenException);
  });
});

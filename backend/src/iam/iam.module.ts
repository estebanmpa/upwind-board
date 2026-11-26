import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { LogoutUseCase } from './application/use-cases/logout.use-case.js';
import { RenewSessionUseCase } from './application/use-cases/renew-session.use-case.js';
import { IdentityProviderRepository } from './domain/repositories/identity-provider.repository.js';
import { SessionService } from './domain/services/session.service.js';
import { UserSyncService } from './domain/services/user-sync.service.js';
import { IAM_OPTIONS, IamModuleOptions } from './iam.options.js';
import { AuthController } from './infrastructure/rest/controllers/auth.controller.js';
import { permissionsGuardProvider } from './infrastructure/rest/guards/permissions.guard.js';
import { AuthenticationMiddleware } from './infrastructure/rest/middlewares/authentication.middleware.js';
import { HttpIdentityProviderService } from './infrastructure/services/identity-provider.service.js';
import { CacheSessionService } from './infrastructure/services/session.service.js';

/**
 * Login through the IAM (OAuth 2.0 authorization code flow) with sessions
 * kept by this backend. Relies on the host's global CacheService,
 * LockService, HashService, LoggerService, RequestDataService and
 * EnvironmentService.
 */
@Module({})
export class IamModule implements NestModule {
  static forRoot(options: IamModuleOptions): DynamicModule {
    return {
      module: IamModule,
      global: true,
      controllers: [AuthController],
      providers: [
        { provide: IAM_OPTIONS, useValue: options },
        {
          provide: IdentityProviderRepository,
          useClass: HttpIdentityProviderService,
        },
        { provide: SessionService, useClass: CacheSessionService },
        { provide: UserSyncService, useClass: options.userSyncService },
        LogoutUseCase,
        RenewSessionUseCase,
        permissionsGuardProvider,
      ],
      exports: [SessionService],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes({ path: '{*splat}', method: RequestMethod.ALL });
  }
}

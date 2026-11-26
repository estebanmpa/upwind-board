import {
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { RequestDataService } from '../../../../domain/services/request-data.service.js';
import { RenewSessionUseCase } from '../../../application/use-cases/renew-session.use-case.js';
import { SessionService } from '../../../domain/services/session.service.js';
import { IAM_OPTIONS, type IamModuleOptions } from '../../../iam.options.js';

const IAM_PUBLIC_PATH_PREFIXES = [
  '/auth/authorize',
  '/auth/token',
  '/auth/logout',
];

/**
 * Every request needs a live session, except the login round-trip and the
 * host app's public prefixes. The session is renewed with IAM when its
 * access token expires and exposed to the request as `session`.
 */
@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly sessionService: SessionService,
    private readonly requestData: RequestDataService,
    private readonly renewSessionUseCase: RenewSessionUseCase,
    @Inject(IAM_OPTIONS) private readonly options: IamModuleOptions,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (this.isPublicPath(req.originalUrl || req.url || '')) return next();

    const sessionId = req.cookies?.[this.sessionService.getCookieName()] as
      string | undefined;
    if (!sessionId) {
      throw new UnauthorizedException('No authorization token found');
    }

    const storedSession = await this.sessionService.getSession(sessionId);
    if (!storedSession) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const { session, cookie } =
      await this.renewSessionUseCase.execute(storedSession);
    if (cookie) res.cookie(cookie.name, cookie.value, cookie.options);

    this.requestData.set('session', session);
    next();
  }

  private isPublicPath(url: string): boolean {
    const path = url.split('?')[0];
    return [
      ...IAM_PUBLIC_PATH_PREFIXES,
      ...(this.options.publicPathPrefixes ?? []),
    ].some((prefix) => path.startsWith(prefix));
  }
}

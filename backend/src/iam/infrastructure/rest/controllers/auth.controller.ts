import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { EnvironmentService } from '../../../../infrastructure/services/environment.service.js';
import { AuthorizeRequestDto } from '../../../application/dto/authorize-request.js';
import { IamTokenExchangeRequestDto } from '../../../application/dto/iam-exchange-token-request.js';
import { TokenExchangeRequestDto } from '../../../application/dto/token-exchange-request.js';
import { UserInfoResponseDto } from '../../../application/dto/user-info-response.js';
import { LogoutUseCase } from '../../../application/use-cases/logout.use-case.js';
import { IdentityProviderRepository } from '../../../domain/repositories/identity-provider.repository.js';
import { SessionService } from '../../../domain/services/session.service.js';
import { UserSyncService } from '../../../domain/services/user-sync.service.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly identityProvider: IdentityProviderRepository,
    private readonly environment: EnvironmentService,
    private readonly sessionService: SessionService,
    private readonly userSyncService: UserSyncService,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  /** Exchanges the authorization code, mirrors the user and opens a session. */
  @Post('token')
  @HttpCode(HttpStatus.OK)
  async token(
    @Body() body: TokenExchangeRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserInfoResponseDto> {
    const iamTokens = await this.identityProvider.tokenExchange(
      new IamTokenExchangeRequestDto(
        'authorization_code',
        body.code,
        this.environment.callbackUrl,
        this.environment.clientId,
        this.environment.clientSecret,
      ),
    );
    const iamUser = await this.identityProvider.userInfo(iamTokens.accessToken);
    const user = await this.userSyncService.execute({
      id: iamUser.userId,
      email: iamUser.email,
      name: iamUser.displayName,
    });

    const cookie = await this.sessionService.createOrRefreshSession({
      userId: user.id,
      iamUserId: user.iamId,
      email: iamUser.email,
      displayName: iamUser.displayName,
      permissions: iamUser.permissions,
      accessToken: iamTokens.accessToken,
      refreshToken: iamTokens.refreshToken,
      expiresIn: iamTokens.expiresIn,
      refreshExpiresIn: iamTokens.refreshExpiresIn,
    });

    response.cookie(cookie.name, cookie.value, cookie.options);
    return UserInfoResponseDto.fromSession(iamUser, this.environment.clientId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const cookieName = this.sessionService.getCookieName();
    const sessionId = request.cookies?.[cookieName] as string | undefined;
    await this.logoutUseCase.execute(sessionId);
    response.clearCookie(cookieName);
  }

  /** IAM login URL the browser must navigate to. */
  @Post('authorize')
  @HttpCode(HttpStatus.OK)
  authorize(@Body() body: AuthorizeRequestDto): Promise<string> {
    return this.identityProvider.authorizationUrl(body.state, body.uiLocales);
  }

  @Post('userinfo')
  @HttpCode(HttpStatus.OK)
  async userInfo(): Promise<UserInfoResponseDto> {
    const session = await this.sessionService.getCurrentSession();
    return UserInfoResponseDto.fromSession(session, this.environment.clientId);
  }
}

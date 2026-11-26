import { DiscoveryResponseDto } from '../../application/dto/discovery-response.js';
import { IamTokenExchangeRequestDto } from '../../application/dto/iam-exchange-token-request.js';
import { IamRefreshTokenRequestDto } from '../../application/dto/iam-refresh-token-request.js';
import { IamUserInfoResponseDto } from '../../application/dto/iam-user-info-response.js';
import { TokenExchangeResponseDto } from '../../application/dto/token-exchange-response.js';

export abstract class IdentityProviderRepository {
  abstract discovery(): Promise<DiscoveryResponseDto>;
  abstract serviceAccountLogin(): Promise<TokenExchangeResponseDto>;
  abstract tokenExchange(
    dto: IamTokenExchangeRequestDto,
  ): Promise<TokenExchangeResponseDto>;
  abstract refreshToken(
    dto: IamRefreshTokenRequestDto,
  ): Promise<TokenExchangeResponseDto>;
  abstract logout(accessToken: string): Promise<void>;
  abstract authorizationUrl(state: string, uiLocales?: string): Promise<string>;
  abstract userInfo(accessToken: string): Promise<IamUserInfoResponseDto>;
}

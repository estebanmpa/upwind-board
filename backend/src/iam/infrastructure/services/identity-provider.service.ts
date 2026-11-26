import { HttpStatus, Inject, Injectable, Optional } from '@nestjs/common';
import {
  CACHE_TTL,
  CacheService,
} from '../../../domain/services/cache.service.js';
import { LoggerService } from '../../../domain/services/logger.service.js';
import { EnvironmentService } from '../../../infrastructure/services/environment.service.js';
import { DiscoveryResponseDto } from '../../application/dto/discovery-response.js';
import { IamClientCredentialsRequestDto } from '../../application/dto/iam-client-credentials-request.js';
import { IamTokenExchangeRequestDto } from '../../application/dto/iam-exchange-token-request.js';
import { IamRefreshTokenRequestDto } from '../../application/dto/iam-refresh-token-request.js';
import { IamUserInfoResponseDto } from '../../application/dto/iam-user-info-response.js';
import { TokenExchangeResponseDto } from '../../application/dto/token-exchange-response.js';
import {
  IdentityProviderUnavailableException,
  SessionNotFoundException,
  UnauthorizedException,
} from '../../domain/exceptions/auth.domain-exception.js';
import { IdentityProviderRepository } from '../../domain/repositories/identity-provider.repository.js';
import { IAM_OPTIONS, type IamModuleOptions } from '../../iam.options.js';

const DISCOVERY_CACHE_KEY = 'iam:discovery';
const REQUEST_TIMEOUT_MS = 10 * 1000;

interface IamErrorBody {
  message?: string | string[];
}

/** The IAM answered with an error status. */
class IamHttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: IamErrorBody | null,
  ) {
    super(`IAM responded with status ${status}`);
  }
}

@Injectable()
export class HttpIdentityProviderService extends IdentityProviderRepository {
  constructor(
    private readonly environment: EnvironmentService,
    private readonly cache: CacheService,
    private readonly logger: LoggerService,
    @Optional()
    @Inject(IAM_OPTIONS)
    private readonly options?: IamModuleOptions,
  ) {
    super();
  }

  async discovery(): Promise<DiscoveryResponseDto> {
    const cached =
      await this.cache.get<DiscoveryResponseDto>(DISCOVERY_CACHE_KEY);
    if (cached) return cached;

    const discovery = await this.call<DiscoveryResponseDto>(
      `${this.environment.iamBaseUrl}/oauth/discovery`,
    );
    await this.cache.set(DISCOVERY_CACHE_KEY, discovery, CACHE_TTL.ONE_DAY);
    return discovery;
  }

  async serviceAccountLogin(): Promise<TokenExchangeResponseDto> {
    return this.requestToken(
      new IamClientCredentialsRequestDto(
        'client_credentials',
        this.environment.clientId,
        this.environment.clientSecret,
      ),
    );
  }

  tokenExchange(
    dto: IamTokenExchangeRequestDto,
  ): Promise<TokenExchangeResponseDto> {
    return this.requestToken(dto);
  }

  refreshToken(
    dto: IamRefreshTokenRequestDto,
  ): Promise<TokenExchangeResponseDto> {
    return this.requestToken(dto);
  }

  async logout(accessToken: string): Promise<void> {
    const discovery = await this.discovery();
    await this.call(this.backChannelUrl(discovery.end_session_endpoint), {
      method: 'POST',
      body: {},
      accessToken,
    });
  }

  /**
   * Where the browser goes to log in. The browser must call the IAM itself:
   * only then does it send the IAM session cookie that skips the login form.
   * The language the browser asks for wins over the configured default.
   */
  async authorizationUrl(state: string, uiLocales?: string): Promise<string> {
    const discovery = await this.discovery();
    const url = new URL(discovery.authorization_endpoint);

    url.searchParams.append('clientId', this.environment.clientId);
    url.searchParams.append('redirectUrl', this.environment.callbackUrl);
    url.searchParams.append('state', state);

    const locales = uiLocales ?? this.options?.uiLocales;
    if (locales) url.searchParams.append('ui_locales', locales);

    return url.toString();
  }

  async userInfo(accessToken: string): Promise<IamUserInfoResponseDto> {
    const discovery = await this.discovery();
    return this.call<IamUserInfoResponseDto>(
      this.backChannelUrl(discovery.userinfo_endpoint),
      { accessToken },
    );
  }

  private async requestToken(
    dto:
      | IamTokenExchangeRequestDto
      | IamRefreshTokenRequestDto
      | IamClientCredentialsRequestDto,
  ): Promise<TokenExchangeResponseDto> {
    const discovery = await this.discovery();
    return this.call<TokenExchangeResponseDto>(
      this.backChannelUrl(discovery.token_endpoint),
      { method: 'POST', body: dto },
    );
  }

  /**
   * The discovery document advertises the IAM's public address, which is
   * meant for the browser and may not be reachable from this server (e.g.
   * `localhost` inside a container). Server-to-server calls keep the path
   * but go through IAM_BASE_URL.
   */
  private backChannelUrl(endpoint: string): string {
    const url = new URL(endpoint);
    const base = new URL(this.environment.iamBaseUrl);
    url.protocol = base.protocol;
    url.host = base.host;
    return url.toString();
  }

  private async call<T>(
    url: string,
    options: {
      method?: 'GET' | 'POST';
      body?: unknown;
      accessToken?: string;
    } = {},
  ): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (options.body !== undefined)
      headers['Content-Type'] = 'application/json';
    if (options.accessToken) {
      headers.Authorization = `Bearer ${options.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        method: options.method ?? 'GET',
        headers,
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const text = await response.text();
      const body: unknown = text ? JSON.parse(text) : undefined;
      if (!response.ok) {
        throw new IamHttpError(response.status, (body as IamErrorBody) ?? null);
      }
      return body as T;
    } catch (error) {
      this.raiseError(error);
    }
  }

  private raiseError(error: unknown): never {
    this.logger.error('Identity provider error', error);

    // The IAM answered with an error (401, 400, etc.)
    if (error instanceof IamHttpError) {
      const raw = error.body?.message;
      const message =
        (Array.isArray(raw) ? raw.join('. ') : raw) || 'IAM Error';

      if (
        error.status === HttpStatus.NOT_FOUND &&
        message.includes('Session not found')
      ) {
        throw new SessionNotFoundException(message);
      }
      throw new UnauthorizedException(message);
    }

    // The IAM did not respond at all (timeout, down, invalid response).
    throw new IdentityProviderUnavailableException();
  }
}

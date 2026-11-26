import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoggerService } from '../../../domain/services/logger.service.js';
import { fakeCache, fakeEnvironment } from '../../test/fakes.js';
import {
  IdentityProviderUnavailableException,
  SessionNotFoundException,
  UnauthorizedException,
} from '../../domain/exceptions/auth.domain-exception.js';
import { HttpIdentityProviderService } from './identity-provider.service.js';

const PUBLIC_IAM = 'http://localhost:3001';
const DISCOVERY = {
  authorization_endpoint: `${PUBLIC_IAM}/oauth/authorize`,
  token_endpoint: `${PUBLIC_IAM}/oauth/token`,
  userinfo_endpoint: `${PUBLIC_IAM}/oauth/userinfo`,
  end_session_endpoint: `${PUBLIC_IAM}/oauth/logout`,
  jwks_uri: `${PUBLIC_IAM}/.well-known/jwks.json`,
  issuer: PUBLIC_IAM,
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status });

function setup(uiLocales?: string) {
  const { cache } = fakeCache();
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  const service = new HttpIdentityProviderService(
    fakeEnvironment(),
    cache,
    logger as unknown as LoggerService,
    {
      cookiePrefix: 'upwind-board',
      userSyncService: class {} as never,
      uiLocales,
    },
  );
  return service;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn((url: string) =>
    Promise.resolve(
      url.endsWith('/oauth/discovery') ? json(200, DISCOVERY) : json(200, {}),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

describe('HttpIdentityProviderService authorizationUrl', () => {
  it('builds the IAM login URL for the browser without calling the IAM', async () => {
    const url = new URL(await setup('en').authorizationUrl('state-1'));
    expect(url.origin + url.pathname).toBe(`${PUBLIC_IAM}/oauth/authorize`);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      clientId: 'upwind-board',
      redirectUrl: 'http://localhost:5000/callback',
      state: 'state-1',
      ui_locales: 'en',
    });
    // Only discovery, which is then cached.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('prefers the language the browser asks for', async () => {
    const url = new URL(await setup('en').authorizationUrl('s', 'es-AR es'));
    expect(url.searchParams.get('ui_locales')).toBe('es-AR es');
  });

  it('caches the discovery document', async () => {
    const service = setup();
    await service.authorizationUrl('a');
    await service.authorizationUrl('b');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('HttpIdentityProviderService back channel', () => {
  it('calls the IAM through IAM_BASE_URL, not its public address', async () => {
    await setup().userInfo('access-1');
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toBe('http://iam-backend-container:3001/oauth/userinfo');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer access-1' });
  });

  it('maps an IAM 401 to UnauthorizedException', async () => {
    const service = setup();
    await service.discovery();
    fetchMock.mockResolvedValueOnce(json(401, { message: 'Invalid code' }));
    await expect(service.tokenExchange({} as never)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('maps an IAM "Session not found" 404 to SessionNotFoundException', async () => {
    const service = setup();
    await service.discovery();
    fetchMock.mockResolvedValueOnce(
      json(404, { message: 'Session not found' }),
    );
    await expect(service.logout('access-1')).rejects.toThrow(
      SessionNotFoundException,
    );
  });

  it('reports the IAM as unavailable when it does not respond', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    await expect(setup().discovery()).rejects.toThrow(
      IdentityProviderUnavailableException,
    );
  });
});

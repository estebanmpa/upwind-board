/** IAM refresh token grant (OAuth 2.0, RFC 6749 section 6). */
export class IamRefreshTokenRequestDto {
  constructor(
    public readonly grantType: 'refresh_token',
    public readonly refreshToken: string,
    public readonly clientId: string,
    public readonly clientSecret: string,
  ) {}
}

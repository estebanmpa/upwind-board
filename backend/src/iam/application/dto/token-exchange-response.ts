/** Tokens issued by the IAM token endpoint. */
export class TokenExchangeResponseDto {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    // Access token lifetime in seconds; older IAM versions omit it.
    public readonly expiresIn?: number,
    // Refresh token lifetime in seconds; older IAM versions omit it.
    public readonly refreshExpiresIn?: number,
  ) {}
}

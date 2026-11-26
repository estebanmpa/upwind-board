/** IAM authorization code grant. */
export class IamTokenExchangeRequestDto {
  constructor(
    public readonly grantType: 'authorization_code',
    public readonly code: string,
    public readonly redirectUrl: string,
    public readonly clientId: string,
    public readonly clientSecret: string,
  ) {}
}

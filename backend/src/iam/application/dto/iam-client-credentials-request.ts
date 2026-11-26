export class IamClientCredentialsRequestDto {
  constructor(
    public readonly grantType: 'client_credentials',
    public readonly clientId: string,
    public readonly clientSecret: string,
  ) {}
}

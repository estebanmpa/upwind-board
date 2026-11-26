/**
 * OpenID Connect Discovery 1.0 document served by the IAM.
 * snake_case is used according to the standard.
 */
export class DiscoveryResponseDto {
  // The URL to which the frontend redirects the user to log in.
  authorization_endpoint: string;
  // URL where the client backend exchanges the 'code' for the JWT.
  token_endpoint: string;
  // URL with public keys to validate the signature of the JWTs.
  jwks_uri: string;
  userinfo_endpoint: string;
  end_session_endpoint: string;
  // The issuer is the URL of the IAM service.
  issuer: string;
}

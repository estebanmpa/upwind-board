import { DomainError } from '../../../domain/errors/domain.error.js';

export class SessionNotFoundException extends DomainError {
  constructor(message = 'Session not found') {
    super(message);
  }
}

export class IdentityProviderUnavailableException extends DomainError {
  constructor(message = 'Identity Provider Service Unavailable') {
    super(message);
  }
}

export class UnauthorizedException extends DomainError {
  constructor(message = 'Unauthorized access') {
    super(message);
  }
}

export class InvalidIamTokenException extends UnauthorizedException {
  constructor(message = 'IAM token has no valid expiration') {
    super(message);
  }
}

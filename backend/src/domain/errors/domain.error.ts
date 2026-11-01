export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" was not found`);
  }
}

/** The request clashes with the current state (duplicates, rows still in use...). */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/** The request is well-formed but breaks a business rule. */
export class BusinessRuleViolationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

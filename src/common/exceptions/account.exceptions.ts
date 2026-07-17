import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class AccountNotFoundException extends DomainException {
  constructor(accountId: string) {
    super(`Account '${accountId}' was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class AccountAlreadyExistsException extends DomainException {
  constructor(accountId: string) {
    super(`Account '${accountId}' already exists.`, HttpStatus.CONFLICT);
  }
}

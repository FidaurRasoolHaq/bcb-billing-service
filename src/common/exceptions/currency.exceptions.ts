import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class CurrencyNotFoundException extends DomainException {
  constructor(currency: string) {
    super(
      `Currency '${currency}' is not registered. Add it via POST /currencies first.`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class CurrencyAlreadyExistsException extends DomainException {
  constructor(currency: string) {
    super(`Currency '${currency}' already exists.`, HttpStatus.CONFLICT);
  }
}

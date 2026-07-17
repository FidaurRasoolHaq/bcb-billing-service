import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class InvalidBillingPeriodException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

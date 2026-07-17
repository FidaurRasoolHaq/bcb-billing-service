import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base class for all domain-specific exceptions. Every subclass maps a
 * business rule violation to a concrete HTTP status, so controllers never
 * need to know about status codes - they just let the service throw.
 */
export abstract class DomainException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}

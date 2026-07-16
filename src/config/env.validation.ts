import { plainToInstance } from 'class-transformer';
import { IsIn, IsNumber, IsPositive, Min, validateSync } from 'class-validator';

/**
 * Typed shape of process.env we actually rely on. `@nestjs/config` runs this
 * validator once at bootstrap so the app fails fast with a clear error
 * instead of crashing later on `undefined` at request time.
 */
class EnvironmentVariables {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string = 'development';

  @IsNumber()
  @Min(0)
  PORT: number = 3000;

  @IsNumber()
  @IsPositive()
  TRANSACTION_FEE_GBP: number = 0.2;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Environment variable validation failed: ${details}`);
  }

  return validatedConfig;
}

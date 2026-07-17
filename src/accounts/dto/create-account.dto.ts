import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateAccountDto {
  @ApiPropertyOptional({
    description:
      'Optional client-supplied account id. If omitted, the server generates a UUID.',
    example: 'acc-123',
  })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  accountId?: string;

  @ApiProperty({
    description:
      'Currency code this account is billed in. Must already be registered.',
    example: 'GBP',
  })
  @IsString()
  @Length(1, 10)
  currency!: string;

  @ApiProperty({
    description:
      'Number of transactions allowed per billing period before per-transaction fees apply.',
    example: 100,
  })
  @IsInt()
  @Min(0)
  transactionThreshold!: number;

  @ApiProperty({
    description:
      'Number of days after account creation during which the promotional discount applies.',
    example: 30,
  })
  @IsInt()
  @Min(0)
  discountDays!: number;

  @ApiProperty({
    description:
      'Promotional discount percentage (0-100) applied during the discount window.',
    example: 15,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountRate!: number;
}

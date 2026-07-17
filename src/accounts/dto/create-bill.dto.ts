import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, Matches, Min } from 'class-validator';

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_ONLY_MESSAGE =
  'must be an ISO 8601 date in YYYY-MM-DD format (no time component)';

export class CreateBillDto {
  @ApiProperty({
    description:
      'Start of the billing period (ISO 8601 date, YYYY-MM-DD), inclusive.',
    example: '2026-01-01',
  })
  @Matches(ISO_DATE_ONLY, {
    message: `billingPeriodStart ${DATE_ONLY_MESSAGE}`,
  })
  @IsISO8601({ strict: true })
  billingPeriodStart!: string;

  @ApiProperty({
    description:
      'End of the billing period (ISO 8601 date, YYYY-MM-DD), exclusive.',
    example: '2026-02-01',
  })
  @Matches(ISO_DATE_ONLY, { message: `billingPeriodEnd ${DATE_ONLY_MESSAGE}` })
  @IsISO8601({ strict: true })
  billingPeriodEnd!: string;

  @ApiProperty({
    description: 'Total number of transactions in the billing period.',
    example: 150,
  })
  @IsInt()
  @Min(0)
  transactionCount!: number;
}

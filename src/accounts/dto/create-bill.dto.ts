import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, Min } from 'class-validator';

export class CreateBillDto {
  @ApiProperty({
    description: 'Start of the billing period (ISO 8601 date), inclusive.',
    example: '2026-01-01',
  })
  @IsISO8601()
  billingPeriodStart!: string;

  @ApiProperty({
    description: 'End of the billing period (ISO 8601 date), exclusive.',
    example: '2026-02-01',
  })
  @IsISO8601()
  billingPeriodEnd!: string;

  @ApiProperty({
    description: 'Total number of transactions in the billing period.',
    example: 150,
  })
  @IsInt()
  @Min(0)
  transactionCount!: number;
}

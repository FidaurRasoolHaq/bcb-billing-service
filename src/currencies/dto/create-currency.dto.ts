import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty({
    description: 'Currency code, e.g. GBP, USD, ZAR.',
    example: 'USD',
  })
  @IsString()
  @Length(1, 10)
  currency!: string;

  @ApiProperty({
    description:
      'Monthly base fee charged in GBP for accounts using this currency.',
    example: 20,
  })
  @IsNumber()
  @IsPositive()
  monthlyFeeGbp!: number;
}

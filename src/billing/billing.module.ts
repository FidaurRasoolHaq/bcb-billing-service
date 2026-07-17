import { Module } from '@nestjs/common';
import { BillingCalculatorService } from './billing-calculator.service';

@Module({
  providers: [BillingCalculatorService],
  exports: [BillingCalculatorService],
})
export class BillingModule {}

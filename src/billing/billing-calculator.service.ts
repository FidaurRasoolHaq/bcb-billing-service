import { Injectable } from '@nestjs/common';
import { InvalidBillingPeriodException } from '../common/exceptions';
import {
  addDays,
  daysInMonth,
  enumerateDays,
  roundGbp,
  startOfUtcDay,
} from '../common/utils';
import type {
  BillBreakdown,
  BillingCalculationInput,
  BillResult,
} from './interfaces/bill-calculation.interface';

// Standalone calculation engine to test in isolation
// Billing Period is [start, end) measured in whole days
// UTC midnight is used to normalize the billing period and discount window
@Injectable()
export class BillingCalculatorService {
  calculate(input: BillingCalculationInput): BillResult {
    const periodStart = startOfUtcDay(input.billingPeriodStart);
    const periodEnd = startOfUtcDay(input.billingPeriodEnd);

    if (periodEnd <= periodStart) {
      throw new InvalidBillingPeriodException(
        'billingPeriodEnd must be strictly after billingPeriodStart.',
      );
    }

    const daysInPeriod = enumerateDays(periodStart, periodEnd);
    const totalDaysInPeriod = daysInPeriod.length;

    const { proratedBaseFeeGbp, discountableBaseFeeGbp, discountDaysInPeriod } =
      this.calculateBaseFeeAndDiscountOverlap(
        daysInPeriod,
        input.monthlyFeeGbp,
        input.accountCreatedAt,
        input.discountDays,
      );

    const { excessTransactions, transactionFeesGbp } =
      this.calculateTransactionFees(
        input.transactionCount,
        input.transactionThreshold,
        input.transactionFeeGbp,
      );

    const discountAmountGbp =
      discountableBaseFeeGbp * (input.discountRate / 100);

    const subtotalGbp = proratedBaseFeeGbp + transactionFeesGbp;
    const totalGbp = subtotalGbp - discountAmountGbp;

    const breakdown: BillBreakdown = {
      baseFee: {
        monthlyFeeGbp: input.monthlyFeeGbp,
        daysInPeriod: totalDaysInPeriod,
        proratedAmountGbp: roundGbp(proratedBaseFeeGbp),
      },
      transactionFees: {
        transactionCount: input.transactionCount,
        threshold: input.transactionThreshold,
        excessTransactions,
        feePerTransactionGbp: input.transactionFeeGbp,
        amountGbp: roundGbp(transactionFeesGbp),
      },
      discount: {
        discountRatePercent: input.discountRate,
        discountDaysInPeriod,
        totalDaysInPeriod,
        discountableAmountGbp: roundGbp(discountableBaseFeeGbp),
        discountAmountGbp: roundGbp(discountAmountGbp),
      },
    };

    return {
      currency: input.currency,
      billingPeriodStart: periodStart.toISOString().slice(0, 10),
      billingPeriodEnd: periodEnd.toISOString().slice(0, 10),
      breakdown,
      subtotalGbp: roundGbp(subtotalGbp),
      totalGbp: roundGbp(totalGbp),
    };
  }

  private calculateBaseFeeAndDiscountOverlap(
    daysInPeriod: Date[],
    monthlyFeeGbp: number,
    accountCreatedAt: Date,
    discountDays: number,
  ): {
    proratedBaseFeeGbp: number;
    discountableBaseFeeGbp: number;
    discountDaysInPeriod: number;
  } {
    const discountWindowStart = startOfUtcDay(accountCreatedAt);
    const discountWindowEnd = addDays(discountWindowStart, discountDays);

    let proratedBaseFeeGbp = 0;
    let discountableBaseFeeGbp = 0;
    let discountDaysInPeriod = 0;

    for (const day of daysInPeriod) {
      // Daily rate uses the actual number of days in that specific day's month, so
      // proration is exact even when a period spans multiple months.
      const dailyBaseFee = monthlyFeeGbp / daysInMonth(day);
      proratedBaseFeeGbp += dailyBaseFee;

      const isDiscountDay =
        day >= discountWindowStart && day < discountWindowEnd;
      if (isDiscountDay) {
        discountableBaseFeeGbp += dailyBaseFee;
        discountDaysInPeriod += 1;
      }
    }

    return { proratedBaseFeeGbp, discountableBaseFeeGbp, discountDaysInPeriod };
  }

  private calculateTransactionFees(
    transactionCount: number,
    transactionThreshold: number,
    transactionFeeGbp: number,
  ): { excessTransactions: number; transactionFeesGbp: number } {
    const excessTransactions = Math.max(
      0,
      transactionCount - transactionThreshold,
    );
    return {
      excessTransactions,
      transactionFeesGbp: excessTransactions * transactionFeeGbp,
    };
  }
}

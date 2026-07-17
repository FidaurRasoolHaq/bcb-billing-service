import { InvalidBillingPeriodException } from '../common/exceptions';
import { BillingCalculatorService } from './billing-calculator.service';
import type { BillingCalculationInput } from './interfaces/bill-calculation.interface';

describe('BillingCalculatorService', () => {
  let service: BillingCalculatorService;

  const baseInput: BillingCalculationInput = {
    currency: 'GBP',
    monthlyFeeGbp: 31, // £1/day in a 31-day month, easy to reason about
    billingPeriodStart: new Date('2026-01-01'),
    billingPeriodEnd: new Date('2026-02-01'), // full January - 31 days
    transactionCount: 0,
    transactionThreshold: 100,
    transactionFeeGbp: 0.2,
    discountRate: 0,
    discountDays: 0,
    accountCreatedAt: new Date('2020-01-01'), // long before the period; no discount overlap
  };

  beforeEach(() => {
    service = new BillingCalculatorService();
  });

  describe('input validation', () => {
    it('throws InvalidBillingPeriodException when end is before start', () => {
      expect(() =>
        service.calculate({
          ...baseInput,
          billingPeriodStart: new Date('2026-02-01'),
          billingPeriodEnd: new Date('2026-01-01'),
        }),
      ).toThrow(InvalidBillingPeriodException);
    });

    it('throws InvalidBillingPeriodException when start equals end', () => {
      expect(() =>
        service.calculate({
          ...baseInput,
          billingPeriodStart: new Date('2026-01-01'),
          billingPeriodEnd: new Date('2026-01-01'),
        }),
      ).toThrow(InvalidBillingPeriodException);
    });
  });

  describe('base fee proration', () => {
    it('charges the full monthly fee for a full calendar month', () => {
      const result = service.calculate(baseInput);
      expect(result.breakdown.baseFee.daysInPeriod).toBe(31);
      expect(result.breakdown.baseFee.proratedAmountGbp).toBe(31);
      expect(result.totalGbp).toBe(31);
    });

    it('prorates correctly for a partial month (10 of 30 days in April)', () => {
      const result = service.calculate({
        ...baseInput,
        monthlyFeeGbp: 30, // £1/day in April (30 days)
        billingPeriodStart: new Date('2026-04-01'),
        billingPeriodEnd: new Date('2026-04-11'), // 10 days
      });

      expect(result.breakdown.baseFee.daysInPeriod).toBe(10);
      expect(result.breakdown.baseFee.proratedAmountGbp).toBe(10);
    });

    it("prorates using each day's own month length across a multi-month span", () => {
      // 3 days in January (31-day month) + 2 days in February (28-day month, 2026 is not a leap year)
      const result = service.calculate({
        ...baseInput,
        monthlyFeeGbp: 31,
        billingPeriodStart: new Date('2026-01-30'),
        billingPeriodEnd: new Date('2026-02-03'), // Jan 30, 31, Feb 1, 2 -> 4 days total
      });

      // Jan 30, Jan 31 -> 2 days at 31/31 = 1/day; Feb 1, Feb 2 -> 2 days at 31/28 per day
      const expected = 2 * (31 / 31) + 2 * (31 / 28);
      expect(result.breakdown.baseFee.daysInPeriod).toBe(4);
      expect(result.breakdown.baseFee.proratedAmountGbp).toBeCloseTo(
        expected,
        2,
      );
    });

    it('handles leap-year February correctly (2028 is a leap year)', () => {
      const result = service.calculate({
        ...baseInput,
        monthlyFeeGbp: 29,
        billingPeriodStart: new Date('2028-02-01'),
        billingPeriodEnd: new Date('2028-03-01'), // Feb 2028 has 29 days
      });

      expect(result.breakdown.baseFee.daysInPeriod).toBe(29);
      expect(result.breakdown.baseFee.proratedAmountGbp).toBe(29);
    });
  });

  describe('transaction fees', () => {
    it('charges no transaction fees when below the threshold', () => {
      const result = service.calculate({
        ...baseInput,
        transactionCount: 50,
        transactionThreshold: 100,
      });
      expect(result.breakdown.transactionFees.excessTransactions).toBe(0);
      expect(result.breakdown.transactionFees.amountGbp).toBe(0);
    });

    it('charges no transaction fees when exactly at the threshold', () => {
      const result = service.calculate({
        ...baseInput,
        transactionCount: 100,
        transactionThreshold: 100,
      });
      expect(result.breakdown.transactionFees.excessTransactions).toBe(0);
    });

    it('charges a fee for every transaction over the threshold', () => {
      const result = service.calculate({
        ...baseInput,
        transactionCount: 150,
        transactionThreshold: 100,
        transactionFeeGbp: 0.5,
      });

      expect(result.breakdown.transactionFees.excessTransactions).toBe(50);
      expect(result.breakdown.transactionFees.amountGbp).toBe(25);
      expect(result.totalGbp).toBe(31 + 25);
    });
  });

  describe('promotional discount', () => {
    it('applies no discount when the discount window is entirely before the billing period', () => {
      const result = service.calculate({
        ...baseInput,
        discountRate: 50,
        discountDays: 10,
        accountCreatedAt: new Date('2025-01-01'), // discount window long expired
      });

      expect(result.breakdown.discount.discountDaysInPeriod).toBe(0);
      expect(result.breakdown.discount.discountAmountGbp).toBe(0);
      expect(result.totalGbp).toBe(result.subtotalGbp);
    });

    it('applies the discount to the whole period when fully covered by the discount window', () => {
      const result = service.calculate({
        ...baseInput,
        discountRate: 20,
        discountDays: 31,
        accountCreatedAt: new Date('2026-01-01'), // covers the entire January period
      });

      expect(result.breakdown.discount.discountDaysInPeriod).toBe(31);
      expect(result.breakdown.discount.discountableAmountGbp).toBe(31);
      expect(result.breakdown.discount.discountAmountGbp).toBeCloseTo(
        31 * 0.2,
        5,
      );
      expect(result.totalGbp).toBeCloseTo(31 - 31 * 0.2, 5);
    });

    it('prorates the discount to only the overlapping days within the billing period', () => {
      // Account created Jan 25 with a 10-day discount window (Jan 25 - Feb 3).
      // Billing period is the full January (Jan 1 - Feb 1), so only Jan 25-31 (7 days) overlap.
      const result = service.calculate({
        ...baseInput,
        discountRate: 50,
        discountDays: 10,
        accountCreatedAt: new Date('2026-01-25'),
      });

      expect(result.breakdown.discount.discountDaysInPeriod).toBe(7);
      expect(result.breakdown.discount.totalDaysInPeriod).toBe(31);
      // 7 of 31 days are discountable base fee (each day is £1 in this fixture)
      expect(result.breakdown.discount.discountableAmountGbp).toBeCloseTo(7, 5);
      expect(result.breakdown.discount.discountAmountGbp).toBeCloseTo(
        7 * 0.5,
        5,
      );
    });

    it('does not discount transaction fees - only the overlapping base fee', () => {
      const result = service.calculate({
        ...baseInput,
        transactionCount: 150,
        transactionThreshold: 100,
        transactionFeeGbp: 1,
        discountRate: 100,
        discountDays: 10,
        accountCreatedAt: new Date('2026-01-25'), // 7 of 31 days overlap
      });

      // Only the 7 overlapping days of base fee (£1/day) are discountable.
      // Transaction fees (£50) are charged in full and never enter the discount.
      expect(result.breakdown.discount.discountableAmountGbp).toBe(7);
      expect(result.breakdown.discount.discountAmountGbp).toBe(7);
      expect(result.breakdown.transactionFees.amountGbp).toBe(50);
      expect(result.subtotalGbp).toBe(31 + 50);
      expect(result.totalGbp).toBe(31 + 50 - 7);
    });

    it('applies no discount when discountDays is zero, even on the creation day', () => {
      const result = service.calculate({
        ...baseInput,
        discountRate: 100,
        discountDays: 0,
        accountCreatedAt: new Date('2026-01-15'),
      });

      expect(result.breakdown.discount.discountDaysInPeriod).toBe(0);
      expect(result.breakdown.discount.discountAmountGbp).toBe(0);
    });
  });

  describe('rounding', () => {
    it('rounds all monetary breakdown figures to 2 decimal places', () => {
      const result = service.calculate({
        ...baseInput,
        monthlyFeeGbp: 10,
        billingPeriodStart: new Date('2026-01-01'),
        billingPeriodEnd: new Date('2026-01-04'), // 3 days of a 31-day month -> not a round number
        transactionCount: 103,
        transactionThreshold: 100,
        transactionFeeGbp: 0.33,
        discountRate: 33,
        discountDays: 3,
        accountCreatedAt: new Date('2026-01-01'),
      });

      const isRoundedToPence = (value: number) =>
        Math.round(value * 100) === value * 100;
      expect(isRoundedToPence(result.breakdown.baseFee.proratedAmountGbp)).toBe(
        true,
      );
      expect(isRoundedToPence(result.breakdown.transactionFees.amountGbp)).toBe(
        true,
      );
      expect(
        isRoundedToPence(result.breakdown.discount.discountAmountGbp),
      ).toBe(true);
      expect(isRoundedToPence(result.subtotalGbp)).toBe(true);
      expect(isRoundedToPence(result.totalGbp)).toBe(true);
    });

    it('always sums the displayed breakdown exactly to the displayed subtotal/total, even when independent rounding of each part would disagree with rounding the raw sum', () => {
      // Chosen so the raw (unrounded) base fee and transaction fee are both
      // ~1.004: roundGbp(1.004) + roundGbp(1.004) = 1.00 + 1.00 = 2.00, but
      // roundGbp(1.004 + 1.004) = roundGbp(2.008) = 2.01. Before the fix,
      // subtotalGbp was computed the second way (from the raw sum) while the
      // breakdown fields were rounded the first way - a penny apart.
      const result = service.calculate({
        ...baseInput,
        monthlyFeeGbp: 1.004 * 29, // exactly £1.004/day over a single 29-day month
        billingPeriodStart: new Date('2028-02-01'), // 2028 is a leap year -> Feb has 29 days
        billingPeriodEnd: new Date('2028-02-02'), // 1 day
        transactionCount: 1,
        transactionThreshold: 0,
        transactionFeeGbp: 1.004,
        discountRate: 50,
        discountDays: 1,
        accountCreatedAt: new Date('2028-02-01'), // the single billed day is a discount day
      });

      const { baseFee, transactionFees, discount } = result.breakdown;

      expect(baseFee.proratedAmountGbp).toBe(1.0);
      expect(transactionFees.amountGbp).toBe(1.0);
      expect(discount.discountableAmountGbp).toBe(1.0);
      expect(discount.discountAmountGbp).toBe(0.5);

      // The invariant a reviewer would actually check by hand:
      expect(baseFee.proratedAmountGbp + transactionFees.amountGbp).toBe(
        result.subtotalGbp,
      );
      expect(result.subtotalGbp - discount.discountAmountGbp).toBe(
        result.totalGbp,
      );
    });
  });
});

export interface BillingCalculationInput {
  currency: string;
  monthlyFeeGbp: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  transactionCount: number;
  transactionThreshold: number;
  transactionFeeGbp: number;
  discountRate: number;
  discountDays: number;
  accountCreatedAt: Date;
}

export interface BaseFeeBreakdown {
  monthlyFeeGbp: number;
  daysInPeriod: number;
  proratedAmountGbp: number;
}

export interface TransactionFeesBreakdown {
  transactionCount: number;
  threshold: number;
  excessTransactions: number;
  feePerTransactionGbp: number;
  amountGbp: number;
}

export interface DiscountBreakdown {
  discountRatePercent: number;
  discountDaysInPeriod: number;
  totalDaysInPeriod: number;
  discountableAmountGbp: number;
  discountAmountGbp: number;
}

export interface BillBreakdown {
  baseFee: BaseFeeBreakdown;
  transactionFees: TransactionFeesBreakdown;
  discount: DiscountBreakdown;
}

export interface BillResult {
  currency: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  breakdown: BillBreakdown;
  subtotalGbp: number;
  totalGbp: number;
}

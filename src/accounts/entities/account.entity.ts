export class Account {
  accountId: string;
  /** Normalized currency code this account is billed against. */
  currency: string;
  /** Number of transactions allowed per billing period before fees kick in. */
  transactionThreshold: number;
  /** Number of days after `createdAt` during which the promotional discount applies. */
  discountDays: number;
  /** Percentage discount (0-100) applied during the discount window. */
  discountRate: number;
  createdAt: Date;
  updatedAt: Date;
  /** Audit metadata - defaults to 'system' since there is no auth layer in scope. */
  createdBy: string;

  constructor(props: {
    accountId: string;
    currency: string;
    transactionThreshold: number;
    discountDays: number;
    discountRate: number;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.accountId = props.accountId;
    this.currency = props.currency;
    this.transactionThreshold = props.transactionThreshold;
    this.discountDays = props.discountDays;
    this.discountRate = props.discountRate;
    this.createdBy = props.createdBy ?? 'system';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? this.createdAt;
  }
}

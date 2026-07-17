import type { BillResult } from '../../billing/interfaces/bill-calculation.interface';

export interface AccountBillResult extends BillResult {
  accountId: string;
}

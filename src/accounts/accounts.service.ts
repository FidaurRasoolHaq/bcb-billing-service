import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AccountAlreadyExistsException,
  AccountNotFoundException,
} from '../common/exceptions';
import type { AppConfig } from '../config/configuration';
import { Currency } from '../currencies/entities/currency.entity';
import { CurrenciesService } from '../currencies/currencies.service';
import { BillingCalculatorService } from '../billing/billing-calculator.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateBillDto } from './dto/create-bill.dto';
import { Account } from './entities/account.entity';
import type { AccountBillResult } from './interfaces/account-bill-result.interface';
import { AccountRepository } from './repositories/account.repository';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly currenciesService: CurrenciesService,
    private readonly billingCalculatorService: BillingCalculatorService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateAccountDto): Promise<Account> {
    // Fail fast on an unknown currency before allocating an id/conflict-checking,
    // so a bad `currency` always surfaces as 404 regardless of accountId state.
    const currency = await this.currenciesService.getByCodeOrThrow(
      dto.currency,
    );

    const accountId = dto.accountId?.trim() || randomUUID();
    const existing = await this.accountRepository.findById(accountId);
    if (existing) {
      throw new AccountAlreadyExistsException(accountId);
    }

    const account = new Account({
      accountId,
      currency: Currency.normalizeCode(currency.code),
      transactionThreshold: dto.transactionThreshold,
      discountDays: dto.discountDays,
      discountRate: dto.discountRate,
    });

    return this.accountRepository.save(account);
  }

  async getByIdOrThrow(accountId: string): Promise<Account> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new AccountNotFoundException(accountId);
    }
    return account;
  }

  async calculateBill(
    accountId: string,
    dto: CreateBillDto,
  ): Promise<AccountBillResult> {
    const account = await this.getByIdOrThrow(accountId);
    const currency = await this.currenciesService.getByCodeOrThrow(
      account.currency,
    );

    const transactionFeeGbp =
      this.configService.get<AppConfig>('app')?.billing.transactionFeeGbp ?? 0;

    const result = this.billingCalculatorService.calculate({
      currency: currency.code,
      monthlyFeeGbp: currency.monthlyFeeGbp,
      billingPeriodStart: new Date(dto.billingPeriodStart),
      billingPeriodEnd: new Date(dto.billingPeriodEnd),
      transactionCount: dto.transactionCount,
      transactionThreshold: account.transactionThreshold,
      transactionFeeGbp,
      discountRate: account.discountRate,
      discountDays: account.discountDays,
      accountCreatedAt: account.createdAt,
    });

    return { accountId: account.accountId, ...result };
  }
}

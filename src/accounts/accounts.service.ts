import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
  AccountAlreadyExistsException,
  AccountNotFoundException,
} from '../common/exceptions';
import { Currency } from '../currencies/entities/currency.entity';
import { CurrenciesService } from '../currencies/currencies.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';
import { AccountRepository } from './repositories/account.repository';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly currenciesService: CurrenciesService,
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

  // Will be used by BillingService to resolve the account for a bill calculation.
  async getByIdOrThrow(accountId: string): Promise<Account> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new AccountNotFoundException(accountId);
    }
    return account;
  }
}

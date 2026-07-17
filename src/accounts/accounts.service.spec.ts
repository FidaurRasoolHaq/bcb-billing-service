import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BillingCalculatorService } from '../billing/billing-calculator.service';
import {
  AccountAlreadyExistsException,
  AccountNotFoundException,
  CurrencyNotFoundException,
} from '../common/exceptions';
import configuration from '../config/configuration';
import { CurrenciesService } from '../currencies/currencies.service';
import { CurrencyRepository } from '../currencies/repositories/currency.repository';
import { InMemoryCurrencyRepository } from '../currencies/repositories/in-memory-currency.repository';
import { AccountsService } from './accounts.service';
import { AccountRepository } from './repositories/account.repository';
import { InMemoryAccountRepository } from './repositories/in-memory-account.repository';

describe('AccountsService', () => {
  let service: AccountsService;
  let currenciesService: CurrenciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [configuration], ignoreEnvFile: true }),
      ],
      providers: [
        AccountsService,
        CurrenciesService,
        BillingCalculatorService,
        { provide: AccountRepository, useClass: InMemoryAccountRepository },
        { provide: CurrencyRepository, useClass: InMemoryCurrencyRepository },
      ],
    }).compile();

    service = module.get(AccountsService);
    currenciesService = module.get(CurrenciesService);

    await currenciesService.create({ currency: 'GBP', monthlyFeeGbp: 20 });
  });

  describe('create', () => {
    it('creates an account with a client-supplied accountId', async () => {
      const account = await service.create({
        accountId: 'acc-123',
        currency: 'gbp',
        transactionThreshold: 100,
        discountDays: 30,
        discountRate: 15,
      });

      expect(account.accountId).toBe('acc-123');
      expect(account.currency).toBe('GBP');
      expect(account.createdBy).toBe('system');
      expect(account.createdAt).toBeInstanceOf(Date);
    });

    it('auto-generates a UUID accountId when omitted', async () => {
      const account = await service.create({
        currency: 'GBP',
        transactionThreshold: 100,
        discountDays: 30,
        discountRate: 15,
      });

      expect(account.accountId).toMatch(/^[0-9a-f-]{36}$/i);
    });

    it('throws CurrencyNotFoundException when the currency is not registered', async () => {
      await expect(
        service.create({
          currency: 'EUR',
          transactionThreshold: 100,
          discountDays: 30,
          discountRate: 15,
        }),
      ).rejects.toThrow(CurrencyNotFoundException);
    });

    it('throws AccountAlreadyExistsException for a duplicate accountId', async () => {
      await service.create({
        accountId: 'acc-dup',
        currency: 'GBP',
        transactionThreshold: 100,
        discountDays: 30,
        discountRate: 15,
      });

      await expect(
        service.create({
          accountId: 'acc-dup',
          currency: 'GBP',
          transactionThreshold: 50,
          discountDays: 10,
          discountRate: 5,
        }),
      ).rejects.toThrow(AccountAlreadyExistsException);
    });
  });

  describe('getByIdOrThrow', () => {
    it('returns the account when it exists', async () => {
      await service.create({
        accountId: 'acc-found',
        currency: 'GBP',
        transactionThreshold: 100,
        discountDays: 30,
        discountRate: 15,
      });

      const account = await service.getByIdOrThrow('acc-found');
      expect(account.accountId).toBe('acc-found');
    });

    it('throws AccountNotFoundException when the account does not exist', async () => {
      await expect(service.getByIdOrThrow('missing')).rejects.toThrow(
        AccountNotFoundException,
      );
    });
  });

  describe('calculateBill', () => {
    it('resolves the account and currency and returns a bill including the accountId', async () => {
      await service.create({
        accountId: 'acc-bill',
        currency: 'GBP',
        transactionThreshold: 100,
        discountDays: 0,
        discountRate: 0,
      });

      const bill = await service.calculateBill('acc-bill', {
        billingPeriodStart: '2026-01-01',
        billingPeriodEnd: '2026-02-01',
        transactionCount: 0,
      });

      expect(bill.accountId).toBe('acc-bill');
      expect(bill.currency).toBe('GBP');
      expect(bill.totalGbp).toBe(20);
    });

    it('throws AccountNotFoundException for a bill request against an unknown account', async () => {
      await expect(
        service.calculateBill('missing', {
          billingPeriodStart: '2026-01-01',
          billingPeriodEnd: '2026-02-01',
          transactionCount: 0,
        }),
      ).rejects.toThrow(AccountNotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import {
  CurrencyAlreadyExistsException,
  CurrencyNotFoundException,
} from '../common/exceptions';
import { CurrenciesService } from './currencies.service';
import { CurrencyRepository } from './repositories/currency.repository';
import { InMemoryCurrencyRepository } from './repositories/in-memory-currency.repository';

describe('CurrenciesService', () => {
  let service: CurrenciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrenciesService,
        { provide: CurrencyRepository, useClass: InMemoryCurrencyRepository },
      ],
    }).compile();

    service = module.get(CurrenciesService);
  });

  describe('create', () => {
    it('creates and returns a new currency with a normalized (upper-case) code', async () => {
      const currency = await service.create({
        currency: 'usd',
        monthlyFeeGbp: 20,
      });

      expect(currency.code).toBe('USD');
      expect(currency.monthlyFeeGbp).toBe(20);
      expect(currency.createdAt).toBeInstanceOf(Date);
    });

    it('throws CurrencyAlreadyExistsException when the currency is already registered', async () => {
      await service.create({ currency: 'GBP', monthlyFeeGbp: 15 });

      await expect(
        service.create({ currency: 'gbp', monthlyFeeGbp: 99 }),
      ).rejects.toThrow(CurrencyAlreadyExistsException);
    });
  });

  describe('getByCodeOrThrow', () => {
    it('returns the currency when it exists', async () => {
      await service.create({ currency: 'ZAR', monthlyFeeGbp: 12 });

      const currency = await service.getByCodeOrThrow('zar');

      expect(currency.code).toBe('ZAR');
    });

    it('throws CurrencyNotFoundException when the currency does not exist', async () => {
      await expect(service.getByCodeOrThrow('EUR')).rejects.toThrow(
        CurrencyNotFoundException,
      );
    });
  });
});

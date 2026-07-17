import { Injectable } from '@nestjs/common';
import { Currency } from '../entities/currency.entity';
import { CurrencyRepository } from './currency.repository';

@Injectable()
export class InMemoryCurrencyRepository implements CurrencyRepository {
  private readonly currenciesByCode = new Map<string, Currency>();

  findByCode(code: string): Promise<Currency | undefined> {
    return Promise.resolve(
      this.currenciesByCode.get(Currency.normalizeCode(code)),
    );
  }

  save(currency: Currency): Promise<Currency> {
    this.currenciesByCode.set(currency.code, currency);
    return Promise.resolve(currency);
  }
}

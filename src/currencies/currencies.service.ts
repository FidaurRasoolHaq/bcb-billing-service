import { Injectable } from '@nestjs/common';
import {
  CurrencyAlreadyExistsException,
  CurrencyNotFoundException,
} from '../common/exceptions';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { Currency } from './entities/currency.entity';
import { CurrencyRepository } from './repositories/currency.repository';

@Injectable()
export class CurrenciesService {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  async create(dto: CreateCurrencyDto): Promise<Currency> {
    const code = Currency.normalizeCode(dto.currency);
    const existing = await this.currencyRepository.findByCode(code);
    if (existing) {
      throw new CurrencyAlreadyExistsException(code);
    }

    const currency = new Currency({ code, monthlyFeeGbp: dto.monthlyFeeGbp });
    return this.currencyRepository.save(currency);
  }

  // To be used in POST /accounts endpoint to validate the currency being passed in
  async getByCodeOrThrow(code: string): Promise<Currency> {
    const currency = await this.currencyRepository.findByCode(code);
    if (!currency) {
      throw new CurrencyNotFoundException(Currency.normalizeCode(code));
    }
    return currency;
  }
}

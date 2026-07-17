import { Currency } from '../entities/currency.entity';


// Using abstract class to eventually implement a persistent repository
// See useClass in CurrenciesModule
// Using async methods to mirror the eventual database driver response

export abstract class CurrencyRepository {
  abstract findByCode(code: string): Promise<Currency | undefined>;
  abstract save(currency: Currency): Promise<Currency>;
}

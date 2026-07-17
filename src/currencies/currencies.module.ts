import { Module } from '@nestjs/common';
import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';
import { CurrencyRepository } from './repositories/currency.repository';
import { InMemoryCurrencyRepository } from './repositories/in-memory-currency.repository';

@Module({
  controllers: [CurrenciesController],
  // Can eventually be swapped out for a persistent repository
  providers: [
    CurrenciesService,
    {
      provide: CurrencyRepository,
      useClass: InMemoryCurrencyRepository,
    },
  ],
  exports: [CurrenciesService],
})
export class CurrenciesModule {}

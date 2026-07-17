import { Module } from '@nestjs/common';
import { CurrenciesModule } from '../currencies/currencies.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AccountRepository } from './repositories/account.repository';
import { InMemoryAccountRepository } from './repositories/in-memory-account.repository';

@Module({
  imports: [CurrenciesModule],
  controllers: [AccountsController],
  // Can eventually be swapped out for a persistent repository
  providers: [
    AccountsService,
    {
      provide: AccountRepository,
      useClass: InMemoryAccountRepository,
    },
  ],
  // Exported so BillingModule can resolve accounts for bill calculations.
  exports: [AccountsService],
})
export class AccountsModule {}

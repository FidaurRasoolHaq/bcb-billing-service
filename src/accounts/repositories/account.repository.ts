import { Account } from '../entities/account.entity';

// Using abstract class to eventually implement a persistent repository
// See useClass in AccountsModule
// Using async methods to mirror the eventual database driver response

export abstract class AccountRepository {
  abstract findById(accountId: string): Promise<Account | undefined>;
  abstract save(account: Account): Promise<Account>;
}

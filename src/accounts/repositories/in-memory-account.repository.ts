import { Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { AccountRepository } from './account.repository';

@Injectable()
export class InMemoryAccountRepository implements AccountRepository {
  private readonly accountsById = new Map<string, Account>();

  findById(accountId: string): Promise<Account | undefined> {
    return Promise.resolve(this.accountsById.get(accountId));
  }

  save(account: Account): Promise<Account> {
    this.accountsById.set(account.accountId, account);
    return Promise.resolve(account);
  }
}

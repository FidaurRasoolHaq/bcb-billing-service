import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateBillDto } from './dto/create-bill.dto';
import { Account } from './entities/account.entity';
import type { AccountBillResult } from './interfaces/account-bill-result.interface';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer account.' })
  @ApiCreatedResponse({ description: 'Account created.', type: Account })
  create(@Body() dto: CreateAccountDto): Promise<Account> {
    return this.accountsService.create(dto);
  }

  @Post(':accountId/bill')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Calculate the total bill for an account over a given billing period.',
  })
  @ApiOkResponse({
    description:
      'Bill calculated, including a full breakdown of how the total was derived.',
  })
  calculateBill(
    @Param('accountId') accountId: string,
    @Body() dto: CreateBillDto,
  ): Promise<AccountBillResult> {
    return this.accountsService.calculateBill(accountId, dto);
  }
}

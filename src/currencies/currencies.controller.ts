import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { Currency } from './entities/currency.entity';

@ApiTags('currencies')
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Post()
  @ApiOperation({
    summary: 'Register a new currency with its monthly base fee (in GBP).',
  })
  @ApiCreatedResponse({ description: 'Currency created.', type: Currency })
  create(@Body() dto: CreateCurrencyDto): Promise<Currency> {
    return this.currenciesService.create(dto);
  }
}

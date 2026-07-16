import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Minimal root controller used only to verify the server is up and
 * reachable (e.g. after deploy or during local development). Feature
 * modules (currencies, accounts, billing) live in their own folders.
 */
@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({
    summary: 'Liveness check - confirms the API is up and reachable.',
  })
  getHello(): { message: string; timestamp: string } {
    return {
      message: 'Hello World! BCB Billing Service is up and running.',
      timestamp: new Date().toISOString(),
    };
  }
}

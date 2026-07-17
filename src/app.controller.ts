import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

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

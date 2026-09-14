import { Controller, Get } from '@nestjs/common';

@Controller('providers')
export class ProviderController {
  @Get('status')
  status() {
    return {
      delivery: 'not-configured',
      payment: 'not-configured',
      subscriptions: 'not-configured',
    };
  }
}

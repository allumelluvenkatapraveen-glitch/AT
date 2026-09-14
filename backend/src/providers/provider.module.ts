import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller.js';
import {
  UnconfiguredDeliveryProvider,
  UnconfiguredPaymentProvider,
  UnconfiguredSubscriptionProvider,
} from './unconfigured.providers.js';

@Module({
  controllers: [ProviderController],
  providers: [UnconfiguredDeliveryProvider, UnconfiguredPaymentProvider, UnconfiguredSubscriptionProvider],
  exports: [UnconfiguredDeliveryProvider, UnconfiguredPaymentProvider, UnconfiguredSubscriptionProvider],
})
export class ProviderModule {}

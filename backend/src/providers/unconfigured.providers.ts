import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { DeliveryProvider, DeliveryQuote, DeliveryQuoteInput } from './delivery.provider.js';
import type { PaymentProvider, PaymentSession } from './payment.provider.js';
import type { SubscriptionProvider, SubscriptionSession } from './subscription.provider.js';

@Injectable()
export class UnconfiguredDeliveryProvider implements DeliveryProvider {
  getQuote(_input: DeliveryQuoteInput): Promise<DeliveryQuote> {
    throw new ServiceUnavailableException('Delivery provider is not configured');
  }
}

@Injectable()
export class UnconfiguredPaymentProvider implements PaymentProvider {
  createSession(_orderId: string, _amount: number, _currencyCode: string): Promise<PaymentSession> {
    throw new ServiceUnavailableException('Payment provider is not configured');
  }
}

@Injectable()
export class UnconfiguredSubscriptionProvider implements SubscriptionProvider {
  createSession(_userId: string, _plan: string): Promise<SubscriptionSession> {
    throw new ServiceUnavailableException('Subscription provider is not configured');
  }
}

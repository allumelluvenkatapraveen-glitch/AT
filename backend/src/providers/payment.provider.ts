export interface PaymentSession {
  provider: string;
  configured: boolean;
  checkoutUrl?: string;
  externalId?: string;
}

export interface PaymentProvider {
  createSession(orderId: string, amount: number, currencyCode: string): Promise<PaymentSession>;
}

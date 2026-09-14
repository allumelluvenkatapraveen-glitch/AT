export interface SubscriptionSession {
  provider: string;
  configured: boolean;
  checkoutUrl?: string;
  externalId?: string;
}

export interface SubscriptionProvider {
  createSession(userId: string, plan: string): Promise<SubscriptionSession>;
}

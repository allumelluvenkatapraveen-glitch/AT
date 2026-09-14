export interface DeliveryQuoteInput {
  orderId: string;
  latitude: number;
  longitude: number;
}

export interface DeliveryQuote {
  provider: string;
  available: boolean;
  currencyCode?: string;
  fee?: number;
  estimatedMinutes?: number;
}

export interface DeliveryProvider {
  getQuote(input: DeliveryQuoteInput): Promise<DeliveryQuote>;
}

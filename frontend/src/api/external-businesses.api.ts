import { apiClient } from './client';
import type { ExternalBusiness } from '../types/external-business';

interface ApiEnvelope<T> {
  value: T;
  Count?: number;
}

export interface ExternalBusinessSearchParams {
  q?: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  category?: string;
  limit?: number;
}

export async function searchExternalBusinesses(
  params: ExternalBusinessSearchParams,
) {
  const response = await apiClient.get<
    ExternalBusiness[] | ApiEnvelope<ExternalBusiness[]>
  >('/external-businesses/search', {
    params,
    timeout: 20000,
  });
  const payload = response.data;
  const businesses =
    payload !== null &&
    typeof payload === 'object' &&
    'value' in payload
      ? payload.value
      : payload;

  if (!Array.isArray(businesses)) {
    throw new Error('Invalid external businesses response');
  }

  return businesses;
}

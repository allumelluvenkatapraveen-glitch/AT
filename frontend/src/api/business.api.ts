import { apiClient } from './client';

export interface BusinessLocation {
  id: string;
  name: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  countryCode: string;
  latitude: number;
  longitude: number;
}

export interface OwnedBusiness {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  locations: BusinessLocation[];
}

interface ApiEnvelope<T> {
  value: T;
}

function unwrap<T>(payload: T | ApiEnvelope<T>) {
  return payload !== null && typeof payload === 'object' && 'value' in payload
    ? payload.value
    : payload;
}

export async function getMyBusinesses() {
  const response = await apiClient.get<OwnedBusiness[] | ApiEnvelope<OwnedBusiness[]>>('/businesses/my');
  return unwrap(response.data);
}

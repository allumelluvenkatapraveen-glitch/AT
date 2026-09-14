import { apiClient } from './client';
import type { LoginInput, LoginResponse, RegisterInput, User } from '../types/auth';

export async function login(input: LoginInput) {
  const response = await apiClient.post<LoginResponse>('/auth/login', input);
  return response.data;
}

export async function register(input: RegisterInput) {
  const response = await apiClient.post<User>('/auth/register', input);
  return response.data;
}

export interface BusinessRegisterInput extends RegisterInput {
  businessName: string;
  businessDescription?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  termsAccepted: boolean;
  marketplaceRulesAccepted: boolean;
  privacyAccepted: boolean;
}

export async function registerBusiness(input: BusinessRegisterInput) {
  const response = await apiClient.post<User>('/auth/business/register', input);
  return response.data;
}

export async function getCurrentUser(token: string) {
  const response = await apiClient.get<User>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

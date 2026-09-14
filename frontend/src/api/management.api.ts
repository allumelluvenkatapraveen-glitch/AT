import { apiClient } from './client';
import type { ProductSummary } from '../types/catalog';

interface ApiEnvelope<T> {
  value: T;
}

function unwrap<T>(payload: T | ApiEnvelope<T>) {
  return payload !== null && typeof payload === 'object' && 'value' in payload
    ? payload.value
    : payload;
}

export async function getMyProducts() {
  const response = await apiClient.get<ProductSummary[] | ApiEnvelope<ProductSummary[]>>('/products/my');
  return unwrap(response.data);
}

export interface CreateProductInput {
  businessLocationId: string;
  categoryId?: string;
  name: string;
  description?: string;
  sku?: string;
  currencyCode: string;
  price: number;
  quantity: number;
}

export async function createProduct(input: CreateProductInput) {
  const response = await apiClient.post<ProductSummary>('/products', input);
  return response.data;
}

export async function updateInventory(id: string, quantity: number) {
  const response = await apiClient.patch(`/products/${id}/inventory`, { quantity });
  return response.data;
}

export async function updateProductStatus(id: string, status: string) {
  const response = await apiClient.patch(`/products/${id}/status`, { status });
  return response.data;
}

export interface ManagedOrder {
  id: string;
  status: string;
  paymentStatus: string;
  fulfillment: string;
  currencyCode: string;
  total: number | string;
  createdAt: string;
  customer: { firstName: string; lastName: string | null; email: string };
  items: Array<{ productName: string; businessName: string; quantity: number }>;
}

export async function getBusinessOrders() {
  const response = await apiClient.get<ManagedOrder[]>('/business/orders');
  return response.data;
}

export async function updateBusinessOrderStatus(id: string, status: string) {
  const response = await apiClient.patch(`/business/orders/${id}/status`, { status });
  return response.data;
}

export interface AdminUser { id: string; email: string; firstName: string; lastName: string | null; status: string; role: string; }
export interface AdminBusiness { id: string; name: string; status: string; owner: { email: string; firstName: string }; locations: Array<{ id: string; city: string; countryCode: string }>; }
export interface AdminProduct { id: string; name: string; status: string; inventory: { quantity: number; isInStock: boolean } | null; businessLocation: { business: { name: string } }; }

export async function getAdminOverview() {
  const [users, businesses, products] = await Promise.all([
    apiClient.get<AdminUser[]>('/admin/users'),
    apiClient.get<AdminBusiness[]>('/admin/businesses'),
    apiClient.get<AdminProduct[]>('/admin/products'),
  ]);
  return { users: users.data, businesses: businesses.data, products: products.data };
}

export async function updateAdminBusinessStatus(id: string, status: string) { await apiClient.patch(`/admin/businesses/${id}/status`, { status }); }
export async function updateAdminProductStatus(id: string, status: string) { await apiClient.patch(`/admin/products/${id}/status`, { status }); }

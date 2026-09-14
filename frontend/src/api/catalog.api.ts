import { apiClient } from './client';
import type { Category, ProductDetailsData, ProductSummary } from '../types/catalog';

interface ApiEnvelope<T> {
  value: T;
  Count?: number;
}

function unwrap<T>(payload: T | ApiEnvelope<T>): T {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'value' in payload
  ) {
    return (payload as ApiEnvelope<T>).value;
  }

  return payload as T;
}

export interface ProductSearchParams {
  q?: string;
  city?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export async function getCategories() {
  const response = await apiClient.get<Category[] | ApiEnvelope<Category[]>>('/categories');
  const categories = unwrap(response.data);

  if (!Array.isArray(categories)) {
    throw new Error('Invalid categories response');
  }

  return categories;
}

export async function searchProducts(params: ProductSearchParams) {
  const response = await apiClient.get<ProductSummary[] | ApiEnvelope<ProductSummary[]>>('/products/search', {
    params,
  });
  const products = unwrap(response.data);

  if (!Array.isArray(products)) {
    throw new Error('Invalid products response');
  }

  return products;
}

export async function getProduct(id: string) {
  const response = await apiClient.get<ProductDetailsData | ApiEnvelope<ProductDetailsData>>(`/products/${id}`);
  return unwrap(response.data);
}

import { apiClient } from './client';

export interface CartProduct {
  id: string;
  name: string;
  price: number | string;
  currencyCode: string;
  inventory?: { quantity: number; isInStock: boolean } | null;
  businessLocation?: { business: { id: string; name: string } };
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface CustomerAddress {
  id: string;
  label: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

export async function getCart() {
  const response = await apiClient.get<Cart | null>('/cart');
  return response.data;
}

export async function addCartItem(productId: string, quantity: number) {
  const response = await apiClient.post<CartItem>('/cart/items', { productId, quantity });
  return response.data;
}

export async function updateCartItem(id: string, quantity: number) {
  const response = await apiClient.patch<CartItem>(`/cart/items/${id}`, { quantity });
  return response.data;
}

export async function removeCartItem(id: string) {
  await apiClient.delete(`/cart/items/${id}`);
}

export async function clearCart() {
  await apiClient.delete('/cart');
}

export interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  fulfillment: 'PICKUP' | 'DELIVERY';
  currencyCode: string;
  subtotal: number | string;
  deliveryFee: number | string;
  total: number | string;
  createdAt: string;
  items: Array<{ id: string; productName: string; businessName: string; quantity: number; unitPrice: number | string; lineTotal: number | string }>;
}

export async function createOrder(fulfillment: 'PICKUP' | 'DELIVERY', deliveryAddress?: Record<string, unknown>) {
  const response = await apiClient.post<Order>('/orders', { fulfillment, deliveryAddress });
  return response.data;
}

export async function getOrders() {
  const response = await apiClient.get<Order[]>('/orders');
  return response.data;
}

export async function cancelOrder(id: string) {
  const response = await apiClient.patch<Order>(`/orders/${id}/cancel`);
  return response.data;
}

export interface Reservation {
  id: string;
  productId: string;
  quantity: number;
  status: string;
  pickupAt: string | null;
  createdAt: string;
  product: { name: string; businessLocation?: { business: { name: string } } };
}

export async function createReservation(productId: string, quantity: number, pickupAt?: string) {
  const response = await apiClient.post<Reservation>('/reservations', { productId, quantity, pickupAt });
  return response.data;
}

export async function getReservations() {
  const response = await apiClient.get<Reservation[]>('/reservations');
  return response.data;
}

export async function cancelReservation(id: string) {
  const response = await apiClient.patch<Reservation>(`/reservations/${id}/cancel`);
  return response.data;
}

export async function getAddresses() {
  const response = await apiClient.get<CustomerAddress[]>('/addresses');
  return response.data;
}

export async function createAddress(input: Omit<CustomerAddress, 'id'>) {
  const response = await apiClient.post<CustomerAddress>('/addresses', input);
  return response.data;
}

export async function deleteAddress(id: string) {
  await apiClient.delete(`/addresses/${id}`);
}

export interface FavoritesResponse {
  products: Array<{ product: CartProduct }>;
  businesses: Array<{ business: { id: string; name: string; description: string | null } }>;
}

export async function getFavorites() {
  const response = await apiClient.get<FavoritesResponse>('/favorites');
  return response.data;
}

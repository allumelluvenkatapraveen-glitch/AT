export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductInventory {
  quantity: number;
  isInStock: boolean;
}

export interface BusinessSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface BusinessLocationSummary {
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

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku?: string | null;
  price: number;
  currencyCode: string;
  status?: string;
  category: Category | null;
  inventory: ProductInventory;
  business: BusinessSummary;
  location: BusinessLocationSummary;
  distanceKm?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductDetailsData = ProductSummary & {
  sku: string | null;
  status: string;
};

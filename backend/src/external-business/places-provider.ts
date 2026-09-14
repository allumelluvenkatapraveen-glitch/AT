export interface ExternalBusinessSearchInput {
  q?: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  category?: string;
  limit: number;
}

export interface ExternalBusiness {
  provider: string;
  externalId: string;
  name: string;
  category: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phone: string | null;
  website: string | null;
  mapsUrl: string | null;
  directionsUrl: string | null;
  attribution: {
    name: string;
    url: string;
  };
}

export interface PlacesProvider {
  search(input: ExternalBusinessSearchInput): Promise<ExternalBusiness[]>;
}

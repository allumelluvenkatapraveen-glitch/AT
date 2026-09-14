import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  ExternalBusiness,
  ExternalBusinessSearchInput,
  PlacesProvider,
} from './places-provider.js';

interface OverpassElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

@Injectable()
export class OsmPlacesProvider implements PlacesProvider {
  private readonly logger = new Logger(OsmPlacesProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async search(input: ExternalBusinessSearchInput): Promise<ExternalBusiness[]> {
    const endpoint = this.configService.get<string>(
      'OSM_OVERPASS_URL',
      'https://overpass-api.de/api/interpreter',
    );
    const radiusMeters = Math.round(input.radiusKm * 1000);
    const searchTerm = [input.q, input.category]
      .filter(Boolean)
      .join(' ')
      .replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
      .trim();
    const categoryTerms = this.categoryTerms(searchTerm);
    const nameFilter = searchTerm ? `["name"~"${searchTerm}",i]` : '["name"]';
    const tagFilter = categoryTerms
      ? `~"${categoryTerms}",i`
      : '';
    const query = `
[out:json][timeout:10];
(
  nwr(around:${radiusMeters},${input.latitude},${input.longitude})${nameFilter}["shop"];
  nwr(around:${radiusMeters},${input.latitude},${input.longitude})${nameFilter}["amenity"];
  nwr(around:${radiusMeters},${input.latitude},${input.longitude})${nameFilter}["office"];
  nwr(around:${radiusMeters},${input.latitude},${input.longitude})${nameFilter}["craft"];
  nwr(around:${radiusMeters},${input.latitude},${input.longitude})${nameFilter}["tourism"];
  ${tagFilter ? `nwr(around:${radiusMeters},${input.latitude},${input.longitude})["shop"${tagFilter}];` : ''}
  ${tagFilter ? `nwr(around:${radiusMeters},${input.latitude},${input.longitude})["amenity"${tagFilter}];` : ''}
  ${tagFilter ? `nwr(around:${radiusMeters},${input.latitude},${input.longitude})["craft"${tagFilter}];` : ''}
);
out center tags;
`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'LocalShoppyy/1.0 (local-commerce discovery)',
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) {
        this.logger.warn(`Overpass request failed with status ${response.status}`);
        return [];
      }

      const payload = (await response.json()) as OverpassResponse;
      return (payload.elements ?? [])
        .map((element) => this.normalize(element, input))
        .filter((business): business is ExternalBusiness => business !== null)
        .filter((business) => business.distanceKm <= input.radiusKm)
        .sort((first, second) => first.distanceKm - second.distanceKm)
        .slice(0, input.limit);
    } catch (error) {
      this.logger.warn(`Overpass request failed: ${String(error)}`);
      return [];
    }
  }

  private normalize(
    element: OverpassElement,
    input: ExternalBusinessSearchInput,
  ): ExternalBusiness | null {
    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;
    const tags = element.tags ?? {};
    const name = tags.name?.trim();

    if (latitude === undefined || longitude === undefined || !name) {
      return null;
    }

    const searchableText = [
      name,
      tags.shop,
      tags.amenity,
      tags.office,
      tags.craft,
      tags.tourism,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const requestedText = [input.q, input.category]
      .filter(Boolean)
      .join(' ')
      .trim()
      .toLowerCase();

    if (requestedText && !requestedText.split(/\s+/).some((term) => searchableText.includes(term))) {
      return null;
    }

    const externalId = `${element.type}/${element.id}`;
    const mapsUrl = `https://www.openstreetmap.org/${element.type}/${element.id}`;
    const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${input.latitude}%2C${input.longitude}%3B${latitude}%2C${longitude}`;
    const address = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'],
      tags['addr:postcode'],
    ]
      .filter(Boolean)
      .join(', ') || null;
    const distanceKm = this.distanceKm(
      input.latitude,
      input.longitude,
      latitude,
      longitude,
    );

    return {
      provider: 'openstreetmap',
      externalId,
      name,
      category:
        tags.shop ?? tags.amenity ?? tags.office ?? tags.craft ?? tags.tourism ?? null,
      address,
      latitude,
      longitude,
      distanceKm: Number(distanceKm.toFixed(2)),
      phone: tags.phone ?? null,
      website: tags.website ?? null,
      mapsUrl,
      directionsUrl,
      attribution: {
        name: 'OpenStreetMap contributors',
        url: 'https://www.openstreetmap.org/copyright',
      },
    };
  }

  private distanceKm(
    latitudeOne: number,
    longitudeOne: number,
    latitudeTwo: number,
    longitudeTwo: number,
  ) {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const latitudeDifference = toRadians(latitudeTwo - latitudeOne);
    const longitudeDifference = toRadians(longitudeTwo - longitudeOne);
    const a =
      Math.sin(latitudeDifference / 2) ** 2 +
      Math.cos(toRadians(latitudeOne)) *
        Math.cos(toRadians(latitudeTwo)) *
        Math.sin(longitudeDifference / 2) ** 2;

    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private categoryTerms(searchTerm: string) {
    const normalized = searchTerm.toLowerCase();
    const terms = new Set<string>();

    if (/car|auto|vehicle|motor/.test(normalized)) {
      ['car', 'car_repair', 'car_parts', 'caravan', 'motorcycle', 'auto'].forEach((term) => terms.add(term));
    }

    if (/food|grocery|market/.test(normalized)) {
      ['supermarket', 'convenience', 'greengrocer', 'bakery', 'butcher'].forEach((term) => terms.add(term));
    }

    if (/phone|mobile|electronics/.test(normalized)) {
      ['electronics', 'mobile_phone', 'computer'].forEach((term) => terms.add(term));
    }

    return terms.size > 0 ? [...terms].join('|') : null;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  ExternalBusiness,
  ExternalBusinessSearchInput,
  PlacesProvider,
} from './places-provider.js';

interface GooglePlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  primaryTypeDisplayName?: { text?: string };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
}

interface GoogleSearchResponse {
  places?: GooglePlace[];
}

@Injectable()
export class GooglePlacesProvider implements PlacesProvider {
  private readonly logger = new Logger(GooglePlacesProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async search(input: ExternalBusinessSearchInput): Promise<ExternalBusiness[]> {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      this.logger.warn('GOOGLE_MAPS_API_KEY is not configured; external search skipped');
      return [];
    }

    const textQuery = [input.q, input.category, 'businesses'].filter(Boolean).join(' ');
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.primaryTypeDisplayName',
          'places.nationalPhoneNumber',
          'places.websiteUri',
          'places.googleMapsUri',
        ].join(','),
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: input.limit,
        locationBias: {
          circle: {
            center: {
              latitude: input.latitude,
              longitude: input.longitude,
            },
            radius: input.radiusKm * 1000,
          },
        },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      this.logger.warn(`Google Places request failed with status ${response.status}`);
      return [];
    }

    const payload = (await response.json()) as GoogleSearchResponse;
    return (payload.places ?? [])
      .map((place) => this.normalize(place, input))
      .filter((place): place is ExternalBusiness => place !== null)
      .filter((place) => place.distanceKm <= input.radiusKm);
  }

  private normalize(
    place: GooglePlace,
    input: ExternalBusinessSearchInput,
  ): ExternalBusiness | null {
    const latitude = place.location?.latitude;
    const longitude = place.location?.longitude;
    const externalId = place.id;
    const name = place.displayName?.text;

    if (
      latitude === undefined ||
      longitude === undefined ||
      !externalId ||
      !name
    ) {
      return null;
    }

    const distanceKm = this.distanceKm(
      input.latitude,
      input.longitude,
      latitude,
      longitude,
    );
    const mapsUrl = place.googleMapsUri ?? null;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}&destination_place_id=${encodeURIComponent(externalId)}`;

    return {
      provider: 'google',
      externalId,
      name,
      category: place.primaryTypeDisplayName?.text ?? null,
      address: place.formattedAddress ?? null,
      latitude,
      longitude,
      distanceKm: Number(distanceKm.toFixed(2)),
      phone: place.nationalPhoneNumber ?? null,
      website: place.websiteUri ?? null,
      mapsUrl,
      directionsUrl,
      attribution: {
        name: 'Google Maps',
        url: mapsUrl ?? 'https://maps.google.com',
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
}

import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ExternalBusiness } from './places-provider.js';
import { GooglePlacesProvider } from './google-places.provider.js';
import { OsmPlacesProvider } from './osm-places.provider.js';
import type { SearchExternalBusinessesDto } from './dto/search-external-businesses.dto.js';

@Injectable()
export class ExternalBusinessService {
  constructor(
    private readonly configService: ConfigService,
    private readonly googlePlacesProvider: GooglePlacesProvider,
    private readonly osmPlacesProvider: OsmPlacesProvider,
  ) {}

  search(dto: SearchExternalBusinessesDto): Promise<ExternalBusiness[]> {
    const provider = this.configService.get<string>('PLACES_PROVIDER', 'none');

    if (provider === 'google') {
      return this.googlePlacesProvider.search({
        q: dto.q?.trim() || undefined,
        category: dto.category?.trim() || undefined,
        latitude: dto.latitude,
        longitude: dto.longitude,
        radiusKm: dto.radiusKm,
        limit: dto.limit,
      });
    }

    if (provider === 'osm') {
      return this.osmPlacesProvider.search({
        q: dto.q?.trim() || undefined,
        category: dto.category?.trim() || undefined,
        latitude: dto.latitude,
        longitude: dto.longitude,
        radiusKm: dto.radiusKm,
        limit: dto.limit,
      });
    }

    if (provider === 'none') {
      return Promise.resolve([]);
    }

    throw new ServiceUnavailableException(`Unsupported places provider: ${provider}`);
  }
}

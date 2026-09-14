import { Module } from '@nestjs/common';
import { ExternalBusinessController } from './external-business.controller.js';
import { ExternalBusinessService } from './external-business.service.js';
import { GooglePlacesProvider } from './google-places.provider.js';
import { OsmPlacesProvider } from './osm-places.provider.js';

@Module({
  controllers: [ExternalBusinessController],
  providers: [ExternalBusinessService, GooglePlacesProvider, OsmPlacesProvider],
})
export class ExternalBusinessModule {}

import { Controller, Get, Query } from '@nestjs/common';
import { ExternalBusinessService } from './external-business.service.js';
import { SearchExternalBusinessesDto } from './dto/search-external-businesses.dto.js';

@Controller('external-businesses')
export class ExternalBusinessController {
  constructor(private readonly externalBusinessService: ExternalBusinessService) {}

  @Get('search')
  search(@Query() dto: SearchExternalBusinessesDto) {
    return this.externalBusinessService.search(dto);
  }
}

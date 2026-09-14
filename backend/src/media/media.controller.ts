import { Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { BusinessImageDto } from '../business/dto/business-image.dto.js';
import { ProductImageDto } from '../product/dto/product-image.dto.js';
import { MediaService } from './media.service.js';

interface AuthRequest extends Request { user: { id: string } }

@Controller()
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly service: MediaService) {}
  @Post('products/:id/images') productImage(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: ProductImageDto) { return this.service.addProductImage(req.user.id, id, dto); }
  @Delete('products/images/:imageId') deleteProductImage(@Req() req: AuthRequest, @Param('imageId') id: string) { return this.service.deleteProductImage(req.user.id, id); }
  @Post('businesses/:id/images') businessImage(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: BusinessImageDto) { return this.service.addBusinessImage(req.user.id, id, dto); }
  @Delete('businesses/images/:imageId') deleteBusinessImage(@Req() req: AuthRequest, @Param('imageId') id: string) { return this.service.deleteBusinessImage(req.user.id, id); }
}

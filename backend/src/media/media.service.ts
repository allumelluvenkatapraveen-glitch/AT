import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BusinessImageDto } from '../business/dto/business-image.dto.js';
import { ProductImageDto } from '../product/dto/product-image.dto.js';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async addProductImage(userId: string, productId: string, dto: ProductImageDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId }, include: { businessLocation: { include: { business: true } }, images: true } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.businessLocation.business.ownerId !== userId) throw new ForbiddenException('You do not manage this product');
    return this.prisma.productImage.create({ data: { productId, storageKey: dto.storageKey, url: dto.url, altText: dto.altText, sortOrder: product.images.length } });
  }

  async addBusinessImage(userId: string, businessId: string, dto: BusinessImageDto) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId }, include: { images: true } });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== userId) throw new ForbiddenException('You do not manage this business');
    return this.prisma.businessImage.create({ data: { businessId, storageKey: dto.storageKey, url: dto.url, altText: dto.altText, sortOrder: business.images.length } });
  }

  async deleteProductImage(userId: string, imageId: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id: imageId }, include: { product: { include: { businessLocation: { include: { business: true } } } } } });
    if (!image) throw new NotFoundException('Image not found');
    if (image.product.businessLocation.business.ownerId !== userId) throw new ForbiddenException('You do not manage this product');
    return this.prisma.productImage.delete({ where: { id: imageId } });
  }

  async deleteBusinessImage(userId: string, imageId: string) {
    const image = await this.prisma.businessImage.findUnique({ where: { id: imageId }, include: { business: true } });
    if (!image) throw new NotFoundException('Image not found');
    if (image.business.ownerId !== userId) throw new ForbiddenException('You do not manage this business');
    return this.prisma.businessImage.delete({ where: { id: imageId } });
  }
}

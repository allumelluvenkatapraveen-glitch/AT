import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AddressDto } from './dto/address.dto.js';
import { CartItemDto, UpdateCartItemDto } from './dto/cart-item.dto.js';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  listAddresses(userId: string) {
    return this.prisma.customerAddress.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
  }

  async createAddress(userId: string, dto: AddressDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) await tx.customerAddress.updateMany({ where: { userId }, data: { isDefault: false } });
      return tx.customerAddress.create({ data: { ...dto, userId, countryCode: dto.countryCode.toUpperCase() } });
    });
  }

  async updateAddress(userId: string, id: string, dto: AddressDto) {
    const address = await this.prisma.customerAddress.findFirst({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) await tx.customerAddress.updateMany({ where: { userId, id: { not: id } }, data: { isDefault: false } });
      return tx.customerAddress.update({ where: { id }, data: { ...dto, countryCode: dto.countryCode.toUpperCase() } });
    });
  }

  async deleteAddress(userId: string, id: string) {
    const address = await this.prisma.customerAddress.findFirst({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');
    return this.prisma.customerAddress.delete({ where: { id } });
  }

  async listFavorites(userId: string) {
    const [products, businesses] = await Promise.all([
      this.prisma.favoriteProduct.findMany({ where: { userId }, include: { product: { include: { category: true, inventory: true, businessLocation: { include: { business: true } } } } } }),
      this.prisma.favoriteBusiness.findMany({ where: { userId }, include: { business: { include: { locations: true } } } }),
    ]);
    return { products, businesses };
  }

  async favoriteProduct(userId: string, productId: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, status: 'ACTIVE', businessLocation: { business: { status: 'ACTIVE' } } } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.favoriteProduct.upsert({ where: { userId_productId: { userId, productId } }, create: { userId, productId }, update: {} });
  }

  removeFavoriteProduct(userId: string, productId: string) {
    return this.prisma.favoriteProduct.deleteMany({ where: { userId, productId } });
  }

  async favoriteBusiness(userId: string, businessId: string) {
    const business = await this.prisma.business.findFirst({ where: { id: businessId, status: 'ACTIVE' } });
    if (!business) throw new NotFoundException('Business not found');
    return this.prisma.favoriteBusiness.upsert({ where: { userId_businessId: { userId, businessId } }, create: { userId, businessId }, update: {} });
  }

  removeFavoriteBusiness(userId: string, businessId: string) {
    return this.prisma.favoriteBusiness.deleteMany({ where: { userId, businessId } });
  }

  async getCart(userId: string) {
    return this.prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: { include: { category: true, inventory: true, businessLocation: { include: { business: true } } } } } } } });
  }

  async addCartItem(userId: string, dto: CartItemDto) {
    const product = await this.prisma.product.findFirst({ where: { id: dto.productId, status: 'ACTIVE', businessLocation: { business: { status: 'ACTIVE' } }, inventory: { isInStock: true, quantity: { gte: dto.quantity } } }, include: { inventory: true } });
    if (!product) throw new NotFoundException('Product is unavailable or out of stock');
    const cart = await this.prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} });
    const existingItem = await this.prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: dto.productId } } });
    if (existingItem && existingItem.quantity + dto.quantity > (product.inventory?.quantity ?? 0)) {
      throw new NotFoundException('Requested cart quantity exceeds available stock');
    }
    return this.prisma.cartItem.upsert({ where: { cartId_productId: { cartId: cart.id, productId: dto.productId } }, create: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity }, update: { quantity: { increment: dto.quantity } } });
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cart: { userId } }, include: { product: { include: { inventory: true } } } });
    if (!item || !item.product.inventory || item.product.inventory.quantity < dto.quantity) throw new NotFoundException('Cart item is unavailable');
    return this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity: dto.quantity } });
  }

  removeCartItem(userId: string, itemId: string) {
    return this.prisma.cartItem.deleteMany({ where: { id: itemId, cart: { userId } } });
  }

  clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({ where: { cart: { userId } } });
  }
}

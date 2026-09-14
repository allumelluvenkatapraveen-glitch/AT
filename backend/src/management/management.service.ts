import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BusinessStatus, OrderStatus, ProductStatus, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

const ownerOrderTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY],
  READY_FOR_PICKUP: [OrderStatus.DELIVERED],
  OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
  REJECTED: [],
};

@Injectable()
export class ManagementService {
  constructor(private readonly prisma: PrismaService) {}

  ownerOrders(userId: string) {
    return this.prisma.order.findMany({ where: { items: { some: { product: { businessLocation: { business: { ownerId: userId } } } } } }, include: { items: { include: { product: { include: { businessLocation: { include: { business: true } } } } } }, customer: { select: { id: true, firstName: true, lastName: true, email: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async updateOwnerOrderStatus(userId: string, orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: { include: { businessLocation: { include: { business: true } } } } } } } });
    if (!order) throw new NotFoundException('Order not found');
    if (!order.items.some((item) => item.product.businessLocation.business.ownerId === userId)) throw new ForbiddenException('You do not manage this order');
    if (!ownerOrderTransitions[order.status].includes(status)) throw new BadRequestException(`Invalid order transition from ${order.status} to ${status}`);
    return this.prisma.order.update({ where: { id: orderId }, data: { status } });
  }

  adminUsers(page = 1, limit = 20, q?: string) { return this.prisma.user.findMany({ where: q ? { OR: [{ email: { contains: q, mode: 'insensitive' } }, { firstName: { contains: q, mode: 'insensitive' } }] } : undefined, select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true, role: true, createdAt: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }); }
  adminBusinesses(page = 1, limit = 20, city?: string) { return this.prisma.business.findMany({ where: city ? { locations: { some: { city: { contains: city, mode: 'insensitive' } } } } : undefined, include: { owner: { select: { id: true, email: true, firstName: true, lastName: true } }, locations: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }); }
  adminProducts(page = 1, limit = 20, q?: string) { return this.prisma.product.findMany({ where: q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { sku: { contains: q, mode: 'insensitive' } }] } : undefined, include: { category: true, inventory: true, businessLocation: { include: { business: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }); }

  updateUserStatus(id: string, status: UserStatus) { return this.prisma.user.update({ where: { id }, data: { status }, select: { id: true, email: true, firstName: true, lastName: true, status: true, role: true } }); }
  updateBusinessStatus(id: string, status: BusinessStatus) { return this.prisma.business.update({ where: { id }, data: { status }, include: { locations: true } }); }
  updateProductStatus(id: string, status: ProductStatus) { return this.prisma.product.update({ where: { id }, data: { status }, include: { inventory: true, category: true } }); }
}

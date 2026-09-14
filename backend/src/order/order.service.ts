import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FulfillmentMethod, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: string, dto: CreateOrderDto) {
    if (dto.fulfillment === FulfillmentMethod.DELIVERY && !dto.deliveryAddress) throw new BadRequestException('A delivery address is required');
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({ where: { userId: customerId }, include: { items: { include: { product: { include: { inventory: true, businessLocation: { include: { business: true } } } } } } } });
      if (!cart?.items.length) throw new BadRequestException('Cart is empty');
      const currencyCodes = new Set(cart.items.map((item) => item.product.currencyCode));
      if (currencyCodes.size !== 1) throw new BadRequestException('Cart items must use the same currency');
      let subtotal = 0;
      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];
      for (const item of cart.items) {
        const inventory = item.product.inventory;
        if (item.product.status !== 'ACTIVE' || !item.product.expiresAt || item.product.expiresAt <= new Date() || item.product.businessLocation.business.status !== 'ACTIVE' || !inventory || inventory.quantity < item.quantity) throw new BadRequestException(`Product unavailable: ${item.product.name}`);
        const unitPrice = Number(item.product.price);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;
        orderItems.push({ product: { connect: { id: item.productId } }, productName: item.product.name, businessName: item.product.businessLocation.business.name, quantity: item.quantity, unitPrice, currencyCode: item.product.currencyCode, lineTotal });
        await tx.inventory.update({ where: { productId: item.productId }, data: { quantity: { decrement: item.quantity }, isInStock: inventory.quantity > item.quantity } });
      }
      const currencyCode = [...currencyCodes][0];
      const order = await tx.order.create({ data: { customerId, fulfillment: dto.fulfillment, deliveryAddress: dto.deliveryAddress as Prisma.InputJsonValue | undefined, currencyCode, subtotal, total: subtotal, items: { create: orderItems } }, include: { items: true } });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });
  }

  list(customerId: string) { return this.prisma.order.findMany({ where: { customerId }, include: { items: true }, orderBy: { createdAt: 'desc' } }); }

  async findById(customerId: string, id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== customerId) throw new ForbiddenException('You cannot view this order');
    return order;
  }

  async cancel(customerId: string, id: string) {
    const order = await this.findById(customerId, id);
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) throw new BadRequestException('This order cannot be cancelled');
    return this.prisma.order.update({ where: { id }, data: { status: OrderStatus.CANCELLED } });
  }
}

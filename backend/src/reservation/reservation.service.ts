import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: string, dto: CreateReservationDto) {
    const product = await this.prisma.product.findFirst({ where: { id: dto.productId, status: 'ACTIVE', expiresAt: { gt: new Date() }, businessLocation: { business: { status: 'ACTIVE' } } }, include: { inventory: true } });
    if (!product || !product.inventory || product.inventory.quantity < dto.quantity) throw new BadRequestException('Product is unavailable for reservation');
    return this.prisma.reservation.create({ data: { customerId, productId: dto.productId, quantity: dto.quantity, pickupAt: dto.pickupAt ? new Date(dto.pickupAt) : undefined }, include: { product: true } });
  }

  list(customerId: string) { return this.prisma.reservation.findMany({ where: { customerId }, include: { product: { include: { businessLocation: { include: { business: true } } } } }, orderBy: { createdAt: 'desc' } }); }

  async findById(customerId: string, id: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id }, include: { product: { include: { businessLocation: { include: { business: true } } } } } });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.customerId !== customerId) throw new ForbiddenException('You cannot view this reservation');
    return reservation;
  }

  async cancel(customerId: string, id: string) {
    const reservation = await this.findById(customerId, id);
    if (reservation.status !== ReservationStatus.PENDING && reservation.status !== ReservationStatus.CONFIRMED) throw new BadRequestException('This reservation cannot be cancelled');
    return this.prisma.reservation.update({ where: { id }, data: { status: ReservationStatus.CANCELLED } });
  }
}

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BusinessHourDto } from './dto/business-hour.dto.js';

@Injectable()
export class BusinessHoursService {
  constructor(private readonly prisma: PrismaService) {}

  list(businessId: string) { return this.prisma.businessHour.findMany({ where: { businessId }, orderBy: { dayOfWeek: 'asc' } }); }

  async replace(userId: string, businessId: string, hours: BusinessHourDto[]) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== userId) throw new ForbiddenException('You do not manage this business');
    return this.prisma.$transaction(async (tx) => {
      await tx.businessHour.deleteMany({ where: { businessId } });
      return tx.businessHour.createMany({ data: hours.map((hour) => ({ ...hour, businessId })) });
    });
  }

  async addClosure(userId: string, businessId: string, date: string, reason?: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== userId) throw new ForbiddenException('You do not manage this business');
    return this.prisma.businessClosure.create({ data: { businessId, date: new Date(date), reason } });
  }
}

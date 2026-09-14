import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BusinessStatus, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBusinessDto } from './dto/create-business.dto.js';
import { UpdateBusinessDto } from './dto/update-business.dto.js';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBusinessDto) {
    const slug = this.createSlug(dto.name);

    return this.prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: dto.name.trim(),
          slug,
          description: dto.description?.trim() || null,
          ownerId: userId,
          locations: {
            create: {
              name: dto.location.name?.trim() || null,
              addressLine1: dto.location.addressLine1.trim(),
              addressLine2: dto.location.addressLine2?.trim() || null,
              city: dto.location.city.trim(),
              state: dto.location.state?.trim() || null,
              postalCode: dto.location.postalCode?.trim() || null,
              countryCode: dto.location.countryCode.trim().toUpperCase(),
              latitude: dto.location.latitude,
              longitude: dto.location.longitude,
            },
          },
        },
        include: {
          locations: true,
        },
      });

      return business;
    });
  }

  async findMyBusinesses(userId: string) {
    return this.prisma.business.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        locations: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const business = await this.prisma.business.findFirst({
      where: {
        id,
        status: 'ACTIVE',
      },
      include: {
        locations: true,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async update(
    businessId: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateBusinessDto,
  ) {
    const business = await this.prisma.business.findUnique({
      where: {
        id: businessId,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (userRole !== UserRole.ADMIN && business.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this business',
      );
    }

    return this.prisma.business.update({
      where: {
        id: businessId,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),
        ...(dto.description !== undefined && {
          description: dto.description.trim(),
        }),
      },
      include: {
        locations: true,
      },
    });
  }
  async updateStatus(businessId: string, status: BusinessStatus) {
    const business = await this.prisma.business.findUnique({
      where: {
        id: businessId,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.prisma.business.update({
      where: {
        id: businessId,
      },
      data: {
        status,
      },
      include: {
        locations: true,
      },
    });
  }
  private createSlug(name: string) {
    const baseSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return `${baseSlug || 'business'}-${randomUUID().slice(0, 8)}`;
  }
}

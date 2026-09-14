import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(actorUserId: string, action: string, targetType: string, targetId: string, metadata?: object) {
    return this.prisma.auditLog.create({ data: { actorUserId, action, targetType, targetId, metadata } });
  }

  list() { return this.prisma.auditLog.findMany({ include: { actor: { select: { id: true, email: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, take: 200 }); }
}

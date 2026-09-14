import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { AuditController } from './audit.controller.js';
import { AuditService } from './audit.service.js';

@Module({ imports: [AuthModule], controllers: [AuditController], providers: [AuditService, RolesGuard], exports: [AuditService] })
export class AuditModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ManagementController } from './management.controller.js';
import { ManagementService } from './management.service.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({ imports: [AuthModule, AuditModule], controllers: [ManagementController], providers: [ManagementService, RolesGuard] })
export class ManagementModule {}

import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

import { BusinessController } from './business.controller.js';
import { BusinessService } from './business.service.js';
import { BusinessHoursController } from './business-hours.controller.js';
import { BusinessHoursService } from './business-hours.service.js';

@Module({
  imports: [AuthModule],
  controllers: [BusinessController, BusinessHoursController],
  providers: [BusinessService, BusinessHoursService, RolesGuard],
})
export class BusinessModule {}
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

import { ProductController } from './product.controller.js';
import { ProductService } from './product.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ProductController],
  providers: [ProductService, RolesGuard],
})
export class ProductModule {}
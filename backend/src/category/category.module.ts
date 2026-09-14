import { Module } from '@nestjs/common';

import { CategoryController } from './category.controller.js';
import { CategoryService } from './category.service.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BusinessModule } from './business/business.module.js';
import { ProductModule } from './product/product.module.js';
import { CategoryModule } from './category/category.module.js';
import { ExternalBusinessModule } from './external-business/external-business.module.js';
import { CustomerModule } from './customer/customer.module.js';
import { OrderModule } from './order/order.module.js';
import { ReservationModule } from './reservation/reservation.module.js';
import { ManagementModule } from './management/management.module.js';
import { CommunityModule } from './community/community.module.js';
import { NotificationModule } from './notification/notification.module.js';
import { AuditModule } from './audit/audit.module.js';
import { MediaModule } from './media/media.module.js';
import { ProviderModule } from './providers/provider.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    BusinessModule,
    ProductModule,
    CategoryModule,
    ExternalBusinessModule,
    CustomerModule,
    OrderModule,
    ReservationModule,
    ManagementModule,
    CommunityModule,
    NotificationModule,
    AuditModule,
    MediaModule,
    ProviderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
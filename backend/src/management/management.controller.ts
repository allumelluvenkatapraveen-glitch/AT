import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { BusinessStatus, OrderStatus, ProductStatus, UserRole, UserStatus } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { IsEnum } from 'class-validator';
import { ManagementService } from './management.service.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { AuditService } from '../audit/audit.service.js';

class OrderStatusDto { @IsEnum(OrderStatus) status!: OrderStatus; }
class UserStatusDto { @IsEnum(UserStatus) status!: UserStatus; }
class BusinessStatusDto { @IsEnum(BusinessStatus) status!: BusinessStatus; }
class ProductStatusDto { @IsEnum(ProductStatus) status!: ProductStatus; }
interface AuthRequest extends Request { user: { id: string } }

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ManagementController {
  constructor(private readonly service: ManagementService, private readonly audit: AuditService) {}

  @Get('business/orders') @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN) ownerOrders(@Req() req: AuthRequest) { return this.service.ownerOrders(req.user.id); }
  @Patch('business/orders/:id/status') @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN) ownerOrderStatus(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: OrderStatusDto) { return this.service.updateOwnerOrderStatus(req.user.id, id, dto.status); }

  @Get('admin/users') @Roles(UserRole.ADMIN) adminUsers(@Query() query: PaginationDto) { return this.service.adminUsers(query.page, query.limit, query.q); }
  @Get('admin/businesses') @Roles(UserRole.ADMIN) adminBusinesses(@Query() query: PaginationDto) { return this.service.adminBusinesses(query.page, query.limit, query.city); }
  @Get('admin/products') @Roles(UserRole.ADMIN) adminProducts(@Query() query: PaginationDto) { return this.service.adminProducts(query.page, query.limit, query.q); }
  @Patch('admin/users/:id/status') @Roles(UserRole.ADMIN) async adminUserStatus(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: UserStatusDto) { const result = await this.service.updateUserStatus(id, dto.status); await this.audit.record(req.user.id, 'USER_STATUS_CHANGED', 'User', id, { status: dto.status }); return result; }
  @Patch('admin/businesses/:id/status') @Roles(UserRole.ADMIN) async adminBusinessStatus(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: BusinessStatusDto) { const result = await this.service.updateBusinessStatus(id, dto.status); await this.audit.record(req.user.id, 'BUSINESS_STATUS_CHANGED', 'Business', id, { status: dto.status }); return result; }
  @Patch('admin/products/:id/status') @Roles(UserRole.ADMIN) async adminProductStatus(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: ProductStatusDto) { const result = await this.service.updateProductStatus(id, dto.status); await this.audit.record(req.user.id, 'PRODUCT_STATUS_CHANGED', 'Product', id, { status: dto.status }); return result; }
}

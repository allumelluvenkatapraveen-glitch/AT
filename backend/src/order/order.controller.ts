import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderService } from './order.service.js';

interface AuthRequest extends Request { user: { id: string } }

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly service: OrderService) {}
  @Post() create(@Req() req: AuthRequest, @Body() dto: CreateOrderDto) { return this.service.create(req.user.id, dto); }
  @Get() list(@Req() req: AuthRequest) { return this.service.list(req.user.id); }
  @Get(':id') find(@Req() req: AuthRequest, @Param('id') id: string) { return this.service.findById(req.user.id, id); }
  @Patch(':id/cancel') cancel(@Req() req: AuthRequest, @Param('id') id: string) { return this.service.cancel(req.user.id, id); }
}

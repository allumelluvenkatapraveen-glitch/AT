import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { ReservationService } from './reservation.service.js';

interface AuthRequest extends Request { user: { id: string } }

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private readonly service: ReservationService) {}
  @Post() create(@Req() req: AuthRequest, @Body() dto: CreateReservationDto) { return this.service.create(req.user.id, dto); }
  @Get() list(@Req() req: AuthRequest) { return this.service.list(req.user.id); }
  @Get(':id') find(@Req() req: AuthRequest, @Param('id') id: string) { return this.service.findById(req.user.id, id); }
  @Patch(':id/cancel') cancel(@Req() req: AuthRequest, @Param('id') id: string) { return this.service.cancel(req.user.id, id); }
}

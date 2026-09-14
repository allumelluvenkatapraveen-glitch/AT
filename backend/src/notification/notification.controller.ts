import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { NotificationService } from './notification.service.js';

interface AuthRequest extends Request { user: { id: string } }

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly service: NotificationService) {}
  @Get() list(@Req() req: AuthRequest) { return this.service.list(req.user.id); }
  @Get('unread-count') unreadCount(@Req() req: AuthRequest) { return this.service.unreadCount(req.user.id); }
  @Patch(':id/read') markRead(@Req() req: AuthRequest, @Param('id') id: string) { return this.service.markRead(req.user.id, id); }
}

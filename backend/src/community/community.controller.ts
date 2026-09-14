import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateMessageDto } from './dto/message.dto.js';
import { CreateReviewDto } from './dto/review.dto.js';
import { CommunityService } from './community.service.js';

interface AuthRequest extends Request { user: { id: string } }

@Controller()
export class CommunityController {
  constructor(private readonly service: CommunityService) {}

  @Get('products/:id/reviews') productReviews(@Param('id') id: string) { return this.service.listProductReviews(id); }
  @Get('businesses/:id/reviews') businessReviews(@Param('id') id: string) { return this.service.listBusinessReviews(id); }

  @Post('products/:id/reviews') @UseGuards(JwtAuthGuard) reviewProduct(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: CreateReviewDto) { return this.service.reviewProduct(req.user.id, { ...dto, targetId: id }); }
  @Post('businesses/:id/reviews') @UseGuards(JwtAuthGuard) reviewBusiness(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: CreateReviewDto) { return this.service.reviewBusiness(req.user.id, { ...dto, targetId: id }); }

  @Get('conversations') @UseGuards(JwtAuthGuard) conversations(@Req() req: AuthRequest) { return this.service.listConversations(req.user.id); }
  @Post('conversations/:businessId') @UseGuards(JwtAuthGuard) start(@Req() req: AuthRequest, @Param('businessId') businessId: string) { return this.service.startConversation(req.user.id, businessId); }
  @Get('conversations/:id/messages') @UseGuards(JwtAuthGuard) messages(@Req() req: AuthRequest, @Param('id') id: string) { return this.service.listMessages(req.user.id, id); }
  @Post('conversations/:id/messages') @UseGuards(JwtAuthGuard) send(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: CreateMessageDto) { return this.service.sendMessage(req.user.id, id, dto); }
}

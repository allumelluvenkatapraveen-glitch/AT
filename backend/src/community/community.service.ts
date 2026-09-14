import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ReviewStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMessageDto } from './dto/message.dto.js';
import { CreateReviewDto } from './dto/review.dto.js';

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  listProductReviews(productId: string) { return this.prisma.review.findMany({ where: { productId, status: ReviewStatus.PUBLISHED }, include: { author: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } }); }
  listBusinessReviews(businessId: string) { return this.prisma.review.findMany({ where: { businessId, status: ReviewStatus.PUBLISHED }, include: { author: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } }); }

  async reviewProduct(userId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.targetId } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.review.create({ data: { authorId: userId, productId: dto.targetId, rating: dto.rating, comment: dto.comment.trim() } });
  }

  async reviewBusiness(userId: string, dto: CreateReviewDto) {
    const business = await this.prisma.business.findFirst({ where: { id: dto.targetId, status: 'ACTIVE' } });
    if (!business) throw new NotFoundException('Business not found');
    return this.prisma.review.create({ data: { authorId: userId, businessId: dto.targetId, rating: dto.rating, comment: dto.comment.trim() } });
  }

  async startConversation(userId: string, businessId: string) {
    const business = await this.prisma.business.findFirst({ where: { id: businessId, status: 'ACTIVE' } });
    if (!business) throw new NotFoundException('Business not found');
    return this.prisma.conversation.create({ data: { businessId, participants: { create: [{ userId }, { userId: business.ownerId }] } }, include: { messages: true } });
  }

  listConversations(userId: string) { return this.prisma.conversation.findMany({ where: { participants: { some: { userId } } }, include: { business: true, participants: true }, orderBy: { updatedAt: 'desc' } }); }

  async listMessages(userId: string, conversationId: string) {
    await this.assertParticipant(userId, conversationId);
    return this.prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } });
  }

  async sendMessage(userId: string, conversationId: string, dto: CreateMessageDto) {
    await this.assertParticipant(userId, conversationId);
    return this.prisma.message.create({ data: { conversationId, senderId: userId, body: dto.body.trim() } });
  }

  private async assertParticipant(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId, userId } } });
    if (!participant) throw new ForbiddenException('You are not part of this conversation');
  }
}

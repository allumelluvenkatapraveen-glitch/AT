import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProductStatus, UserRole } from '@prisma/client';

describe('ProductService', () => {
  let service: ProductService;
  const prisma = {
    product: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn(), create: vi.fn() },
    category: { findUnique: vi.fn() },
    businessLocation: { findUnique: vi.fn() },
    inventory: { upsert: vi.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('activates a product with a one calendar-month expiry', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      status: ProductStatus.DRAFT,
      businessLocation: { business: { ownerId: 'owner-1', status: 'ACTIVE' } },
    });
    prisma.product.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ data }));

    const result = await service.updateStatus('product-1', 'owner-1', UserRole.BUSINESS_OWNER, { status: ProductStatus.ACTIVE });
    const data = (result as { data: { publishedAt: Date; expiresAt: Date; status: ProductStatus } }).data;
    expect(data.status).toBe(ProductStatus.ACTIVE);
    expect(data.publishedAt).toBeInstanceOf(Date);
    expect(data.expiresAt.getMonth()).toBe((data.publishedAt.getMonth() + 1) % 12);
  });

  it('renews an expired product only for its owner and active business', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      status: ProductStatus.EXPIRED,
      businessLocation: { business: { ownerId: 'owner-1', status: 'ACTIVE' } },
    });
    prisma.product.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ data }));

    const result = await service.renew('product-1', 'owner-1', UserRole.BUSINESS_OWNER);
    const data = (result as { data: { status: ProductStatus; expiresAt: Date } }).data;
    expect(data.status).toBe(ProductStatus.ACTIVE);
    expect(data.expiresAt).toBeInstanceOf(Date);
  });

  it('runs expiration enforcement before customer search', async () => {
    prisma.product.updateMany.mockResolvedValue({ count: 1 });
    prisma.product.findMany.mockResolvedValue([]);

    await service.search({ limit: 10 });

    expect(prisma.product.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ status: ProductStatus.ACTIVE, expiresAt: expect.any(Object) }),
    }));
    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ status: ProductStatus.ACTIVE, expiresAt: expect.objectContaining({ gt: expect.any(Date) }) }),
    }));
  });
});

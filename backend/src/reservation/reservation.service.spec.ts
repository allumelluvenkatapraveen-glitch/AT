import { BadRequestException } from '@nestjs/common';
import { ReservationService } from './reservation.service.js';

describe('ReservationService', () => {
  it('rejects an expired product reservation', async () => {
    const prisma = {
      product: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };
    const service = new ReservationService(prisma as never);

    await expect(service.create('customer-1', { productId: 'product-1', quantity: 1 })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.product.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ expiresAt: expect.objectContaining({ gt: expect.any(Date) }) }) }));
  });
});

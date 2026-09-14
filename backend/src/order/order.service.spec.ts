import { BadRequestException } from '@nestjs/common';
import { FulfillmentMethod } from '@prisma/client';
import { OrderService } from './order.service.js';

describe('OrderService', () => {
  it('rejects an expired product during checkout', async () => {
    const prisma = {
      $transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback({
        cart: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'cart-1',
            items: [{
              quantity: 1,
              productId: 'product-1',
              product: {
                name: 'Expired product',
                status: 'EXPIRED',
                expiresAt: new Date(Date.now() - 1000),
                currencyCode: 'USD',
                price: 10,
                inventory: { quantity: 4 },
                businessLocation: { business: { status: 'ACTIVE', name: 'Shop' } },
              },
            }],
          }),
        },
      })),
    };
    const service = new OrderService(prisma as never);

    await expect(service.create('customer-1', { fulfillment: FulfillmentMethod.PICKUP })).rejects.toBeInstanceOf(BadRequestException);
  });
});

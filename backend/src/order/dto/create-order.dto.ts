import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { FulfillmentMethod } from '@prisma/client';

export class CreateOrderDto {
  @IsEnum(FulfillmentMethod)
  fulfillment!: FulfillmentMethod;

  @IsOptional()
  @IsObject()
  deliveryAddress?: Record<string, unknown>;
}

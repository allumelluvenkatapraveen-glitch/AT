import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateReservationDto {
  @IsUUID() productId!: string;
  @IsInt() @Min(1) quantity!: number;
  @IsOptional() @IsDateString() pickupAt?: string;
}

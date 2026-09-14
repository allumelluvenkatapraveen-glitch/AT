import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchExternalBusinessesDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.1)
  @Max(50)
  @IsOptional()
  @Type(() => Number)
  radiusKm = 10;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  @IsOptional()
  @Type(() => Number)
  limit = 10;
}

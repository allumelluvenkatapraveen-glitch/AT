import { IsBoolean, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddressDto {
  @IsOptional() @IsString() @MaxLength(100) label?: string;
  @IsString() @IsNotEmpty() @MaxLength(255) addressLine1!: string;
  @IsOptional() @IsString() @MaxLength(255) addressLine2?: string;
  @IsString() @IsNotEmpty() @MaxLength(100) city!: string;
  @IsOptional() @IsString() @MaxLength(100) state?: string;
  @IsOptional() @IsString() @MaxLength(20) postalCode?: string;
  @IsString() @IsNotEmpty() @MaxLength(2) countryCode!: string;
  @IsOptional() @IsLatitude() latitude?: number;
  @IsOptional() @IsLongitude() longitude?: number;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

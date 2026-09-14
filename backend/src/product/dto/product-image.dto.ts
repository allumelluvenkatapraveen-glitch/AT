import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ProductImageDto {
  @IsString() @MaxLength(500) storageKey!: string;
  @IsUrl({ require_tld: false }) url!: string;
  @IsOptional() @IsString() @MaxLength(255) altText?: string;
}

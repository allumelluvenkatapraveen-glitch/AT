import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class BusinessHourDto {
  @IsInt() @Min(0) @Max(6) dayOfWeek!: number;
  @IsBoolean() isClosed!: boolean;
  @IsOptional() @IsString() opensAt?: string;
  @IsOptional() @IsString() closesAt?: string;
}

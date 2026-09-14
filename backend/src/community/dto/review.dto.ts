import { IsInt, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsInt() @Min(1) @Max(5) rating!: number;
  @IsString() @MinLength(1) @MaxLength(2000) comment!: string;
  @IsUUID() targetId!: string;
}

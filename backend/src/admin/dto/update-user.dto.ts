import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  nickname?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

export class AdjustPointsDto {
  @IsInt()
  delta: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

import { IsInt, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

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

  /** 设为 null 可解除中转站管理员身份 */
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  managedStationId?: number | null;
}

export class AdjustPointsDto {
  @IsInt()
  delta: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

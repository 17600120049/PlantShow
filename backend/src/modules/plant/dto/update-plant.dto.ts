import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { PlantStatus } from '@prisma/client';

export class UpdatePlantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  species?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  generation?: number;

  @IsOptional()
  @IsEnum(PlantStatus)
  status?: PlantStatus;

  @IsOptional()
  @IsString()
  description?: string;
}

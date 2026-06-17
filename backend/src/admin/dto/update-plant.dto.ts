import { IsArray, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { PlantListStatus, PlantStatus } from '@prisma/client';

export class UpdatePlantDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  species?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsEnum(PlantStatus)
  status?: PlantStatus;

  @IsOptional()
  @IsEnum(PlantListStatus)
  listStatus?: PlantListStatus;

  @IsOptional()
  @IsInt()
  stationId?: number | null;
}

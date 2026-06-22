import { IsArray, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PlantListStatus } from '@prisma/client';

export class UpdateManagedPlantDto {
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
  @IsEnum(PlantListStatus)
  listStatus?: PlantListStatus;
}

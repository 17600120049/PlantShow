import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePlantDto {
  @IsString()
  name: string;

  @IsString()
  species: string;

  @IsString()
  source: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  generation?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

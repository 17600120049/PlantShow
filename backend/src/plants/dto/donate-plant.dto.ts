import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class DonatePlantDto {
  @IsOptional()
  @IsString()
  plantCode?: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  category: string;

  @IsInt()
  stationId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}

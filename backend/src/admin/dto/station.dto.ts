import {
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateStationDto {
  @IsString()
  @MinLength(1)
  stationCode: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  address: string;

  @IsString()
  @MinLength(1)
  hours: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}

export class UpdateStationDto {
  @IsOptional()
  @IsString()
  stationCode?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  hours?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string | null;
}

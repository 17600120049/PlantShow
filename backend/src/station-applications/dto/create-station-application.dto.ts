import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateStationApplicationDto {
  @IsString()
  @MinLength(1)
  applicantName: string;

  @IsString()
  @MinLength(1)
  phone: string;

  @IsString()
  @MinLength(1)
  stationName: string;

  @IsString()
  @MinLength(1)
  address: string;

  @IsOptional()
  @IsString()
  hours?: string;

  @IsOptional()
  @IsString()
  intro?: string;
}

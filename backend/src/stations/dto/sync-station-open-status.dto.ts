import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SyncStationOpenStatusDto {
  @IsOptional()
  @IsString()
  wifiSsid?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

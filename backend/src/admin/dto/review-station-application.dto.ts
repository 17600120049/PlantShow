import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StationApplicationStatus } from '@prisma/client';

export class ReviewStationApplicationDto {
  @IsEnum(StationApplicationStatus)
  status: StationApplicationStatus;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}

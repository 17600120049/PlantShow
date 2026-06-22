import { IsBoolean } from 'class-validator';

export class SetStationOpenStatusDto {
  @IsBoolean()
  isActive: boolean;
}

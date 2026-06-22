import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

const CONTACT_TYPES = ['PHONE', 'WECHAT'] as const;
const HOURS_MODES = ['FIXED', 'FLEXIBLE'] as const;
export type ContactTypeDto = (typeof CONTACT_TYPES)[number];
export type HoursModeDto = (typeof HOURS_MODES)[number];

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

  @IsOptional()
  @IsIn(HOURS_MODES)
  hoursMode?: HoursModeDto;

  @ValidateIf((dto) => dto.hoursMode !== 'FLEXIBLE')
  @IsString()
  @MinLength(1)
  hours: string;

  @IsOptional()
  @IsIn(CONTACT_TYPES)
  contactType?: ContactTypeDto;

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
  @IsIn(HOURS_MODES)
  hoursMode?: HoursModeDto;

  @ValidateIf((dto) => dto.hoursMode !== 'FLEXIBLE')
  @IsOptional()
  @IsString()
  hours?: string;

  @IsOptional()
  @IsIn(CONTACT_TYPES)
  contactType?: ContactTypeDto;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string | null;
}

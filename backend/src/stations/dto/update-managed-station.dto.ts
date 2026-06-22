import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

const CONTACT_TYPES = ['PHONE', 'WECHAT'] as const;
const HOURS_MODES = ['FIXED', 'FLEXIBLE'] as const;

export class UpdateManagedStationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  address?: string;

  @IsOptional()
  @IsIn(HOURS_MODES)
  hoursMode?: (typeof HOURS_MODES)[number];

  @ValidateIf((dto) => dto.hoursMode !== 'FLEXIBLE')
  @IsOptional()
  @IsString()
  hours?: string;

  @IsOptional()
  @IsIn(CONTACT_TYPES)
  contactType?: (typeof CONTACT_TYPES)[number];

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @IsOptional()
  @IsString()
  wifiSsid?: string | null;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(2000)
  autoOpenRadiusM?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(48)
  autoCloseHours?: number;

  @IsOptional()
  @IsBoolean()
  autoStatusEnabled?: boolean;
}

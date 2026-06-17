import { IsOptional, IsString } from 'class-validator';

export class DevLoginDto {
  @IsOptional()
  @IsString()
  openid?: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}

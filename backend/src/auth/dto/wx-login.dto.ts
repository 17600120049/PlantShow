import { IsOptional, IsString } from 'class-validator';

export class WxLoginDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  referralCode?: string;
}

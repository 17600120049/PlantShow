import { IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  openid: string;

  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

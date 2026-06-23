import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DevLoginDto } from './dto/dev-login.dto';
import { WxLoginDto } from './dto/wx-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wx-login')
  wxLogin(@Body() dto: WxLoginDto) {
    return this.authService.wxLogin(dto.code, dto.referralCode);
  }

  @Post('dev-login')
  devLogin(@Body() dto: DevLoginDto) {
    if (process.env.DISABLE_DEV_LOGIN === 'true') {
      throw new ForbiddenException('开发登录已禁用');
    }
    return this.authService.devLogin(dto.openid, dto.nickname, dto.referralCode);
  }
}

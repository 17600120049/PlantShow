import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DevLoginDto } from './dto/dev-login.dto';
import { WxLoginDto } from './dto/wx-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wx-login')
  wxLogin(@Body() dto: WxLoginDto) {
    return this.authService.wxLogin(dto.code);
  }

  @Post('dev-login')
  devLogin(@Body() dto: DevLoginDto) {
    return this.authService.devLogin(dto.openid, dto.nickname);
  }
}

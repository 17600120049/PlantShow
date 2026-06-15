import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokenDto> {
    const { openid, nickname, avatar } = loginDto;
    
    let user = await PrismaService.prisma.user.findUnique({
      where: { openid },
    });

    if (!user) {
      user = await PrismaService.prisma.user.create({
        data: {
          openid,
          nickname,
          avatar,
        },
      });
    }

    const payload = { userId: user.id, openid };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }

  async validateUser(payload: any): Promise<any> {
    const user = await PrismaService.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    return user;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async devLogin(openid = 'dev-user-openid', nickname = '叶子先生') {
    const user = await this.prisma.user.upsert({
      where: { openid },
      update: { nickname },
      create: { openid, nickname },
    });

    const token = await this.jwtService.signAsync({
      sub: user.id,
      openid: user.openid,
    });

    return {
      token,
      user: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        points: user.points,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }
}

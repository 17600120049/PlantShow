import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WechatService } from './wechat.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly wechatService: WechatService,
  ) {}

  async wxLogin(code: string) {
    const session = await this.wechatService.code2Session(code);

    const user = await this.prisma.user.upsert({
      where: { openid: session.openid },
      update: {},
      create: {
        openid: session.openid,
        nickname: '微信用户',
      },
    });

    return this.issueAuthResponse(user);
  }

  async devLogin(openid = 'dev-user-openid', nickname = '叶子先生') {
    const user = await this.prisma.user.upsert({
      where: { openid },
      update: { nickname },
      create: { openid, nickname },
    });

    return this.issueAuthResponse(user);
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }

  private async issueAuthResponse(user: User) {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      openid: user.openid,
    });

    return {
      token,
      user: this.toUserDto(user),
    };
  }

  toUserDto(user: User) {
    return {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar,
      points: user.points,
      city: user.city,
    };
  }
}

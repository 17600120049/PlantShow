import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WechatService } from './wechat.service';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly wechatService: WechatService,
  ) {}

  private async getValidReferralCode(): Promise<string> {
    for (let i = 0; i < 10; i++) {
      const code = generateReferralCode();
      const existing = await this.prisma.user.findUnique({ where: { referralCode: code } });
      if (!existing) return code;
    }
    throw new Error('无法生成有效的邀请码');
  }

  async wxLogin(code: string, referralCode?: string) {
    const session = await this.wechatService.code2Session(code);

    const user = await this.prisma.user.upsert({
      where: { openid: session.openid },
      update: {},
      create: {
        openid: session.openid,
        nickname: '微信用户',
        points: 10,
        inviteUnlocked: false,
        referralCode: await this.getValidReferralCode(),
      },
    });

    // 处理邀请逻辑
    if (referralCode && user.referredById === null) {
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode },
      });
      if (referrer && referrer.id !== user.id) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { referredById: referrer.id },
        });
        // 解锁邀请人的积分
        if (!referrer.inviteUnlocked) {
          await this.prisma.user.update({
            where: { id: referrer.id },
            data: { inviteUnlocked: true },
          });
        }
      }
    }

    return this.issueAuthResponse(user);
  }

  async devLogin(openid = 'dev-user-openid', nickname = '叶子先生', referralCode?: string) {
    const user = await this.prisma.user.upsert({
      where: { openid },
      update: { nickname },
      create: {
        openid,
        nickname,
        points: 10,
        inviteUnlocked: false,
        referralCode: await this.getValidReferralCode(),
      },
    });

    // 处理邀请逻辑
    if (referralCode && user.referredById === null) {
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode },
      });
      if (referrer && referrer.id !== user.id) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { referredById: referrer.id },
        });
        if (!referrer.inviteUnlocked) {
          await this.prisma.user.update({
            where: { id: referrer.id },
            data: { inviteUnlocked: true },
          });
        }
      }
    }

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
      inviteUnlocked: user.inviteUnlocked,
      referralCode: user.referralCode,
      city: user.city,
    };
  }
}

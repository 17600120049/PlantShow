import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: admin.id,
      username: admin.username,
      role: admin.role,
      type: 'admin',
    });

    return {
      accessToken,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    };
  }

  async validateAdmin(adminId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }
    return admin;
  }
}

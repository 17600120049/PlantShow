import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Admin, User, Plant, Post, Report, ReportStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginAdminDto } from './dto/login-admin.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    private jwtService: JwtService,
  ) {}

  async login(loginAdminDto: LoginAdminDto): Promise<{ accessToken: string; admin: Admin }> {
    const admin = await PrismaService.prisma.admin.findUnique({
      where: { username: loginAdminDto.username },
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginAdminDto.password, admin.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const payload = { adminId: admin.id, username: admin.username };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, admin };
  }

  async getDashboardStats() {
    const userCount = await PrismaService.prisma.user.count();
    const plantCount = await PrismaService.prisma.plant.count();
    const postCount = await PrismaService.prisma.post.count();
    const tradeCount = await PrismaService.prisma.trade.count();
    const pendingReportCount = await PrismaService.prisma.report.count({
      where: { status: ReportStatus.PENDING },
    });

    return {
      userCount,
      plantCount,
      postCount,
      tradeCount,
      pendingReportCount,
    };
  }

  async getUsers(page: number, limit: number): Promise<{ users: User[]; total: number }> {
    const users = await PrismaService.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await PrismaService.prisma.user.count();

    return { users, total };
  }

  async deleteUser(userId: string): Promise<void> {
    await PrismaService.prisma.user.delete({
      where: { id: userId },
    });
  }

  async getPlants(page: number, limit: number): Promise<{ plants: Plant[]; total: number }> {
    const plants = await PrismaService.prisma.plant.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        owner: {
          select: { id: true, nickname: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await PrismaService.prisma.plant.count();

    return { plants, total };
  }

  async deletePlant(plantId: string): Promise<void> {
    await PrismaService.prisma.plant.delete({
      where: { id: plantId },
    });
  }

  async getPosts(page: number, limit: number): Promise<{ posts: Post[]; total: number }> {
    const posts = await PrismaService.prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { id: true, nickname: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await PrismaService.prisma.post.count();

    return { posts, total };
  }

  async deletePost(postId: string): Promise<void> {
    await PrismaService.prisma.post.delete({
      where: { id: postId },
    });
  }

  async getReports(page: number, limit: number): Promise<{ reports: Report[]; total: number }> {
    const reports = await PrismaService.prisma.report.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { id: true, nickname: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await PrismaService.prisma.report.count();

    return { reports, total };
  }

  async updateReport(reportId: string, status: ReportStatus): Promise<Report> {
    return PrismaService.prisma.report.update({
      where: { id: reportId },
      data: { status },
    });
  }
}

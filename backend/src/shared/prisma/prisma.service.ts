import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// 创建全局单例 PrismaClient 实例
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
});

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  static prisma = prisma;

  async onModuleInit() {
    await prisma.$connect();
  }

  async onModuleDestroy() {
    await prisma.$disconnect();
  }

  static async connect() {
    await prisma.$connect();
  }

  static async disconnect() {
    await prisma.$disconnect();
  }
}

// 导出原始 prisma 实例供使用
export const prismaClient = prisma;

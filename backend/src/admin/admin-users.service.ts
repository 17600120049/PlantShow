import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustPointsDto, UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(keyword?: string) {
    const where = keyword
      ? {
          OR: [
            { nickname: { contains: keyword } },
            { openid: { contains: keyword } },
            { city: { contains: keyword } },
          ],
        }
      : undefined;

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            plants: true,
            plantHistories: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar,
      city: user.city,
      bio: user.bio,
      points: user.points,
      plantCount: user._count.plants,
      historyCount: user._count.plantHistories,
      createdAt: user.createdAt,
    }));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { plants: true, bredPlants: true } },
        plantHistories: {
          take: 10,
          orderBy: { timestamp: 'desc' },
          include: { plant: { select: { name: true, plantCode: true } } },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.ensureUser(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async adjustPoints(id: string, dto: AdjustPointsDto) {
    const user = await this.ensureUser(id);
    const nextPoints = user.points + dto.delta;
    if (nextPoints < 0) {
      throw new BadRequestException('积分不能为负数');
    }

    return this.prisma.user.update({
      where: { id },
      data: { points: nextPoints },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { plants: true, posts: true } } },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user._count.plants > 0 || user._count.posts > 0) {
      throw new BadRequestException('该用户有关联植物或动态，无法删除');
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  private async ensureUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }
}

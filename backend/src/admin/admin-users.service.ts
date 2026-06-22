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
        stationManagers: {
          include: {
            station: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return users.map((user) => this.toAdminUserDto(user));
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
        stationManagers: {
          include: {
            station: {
              select: { id: true, name: true },
            },
          },
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

    const { managedStationId, ...profile } = dto;
    const data: {
      nickname?: string;
      city?: string;
      bio?: string;
    } = {};

    if (profile.nickname !== undefined) {
      data.nickname = profile.nickname;
    }
    if (profile.city !== undefined) {
      data.city = profile.city;
    }
    if (profile.bio !== undefined) {
      data.bio = profile.bio;
    }

    await this.prisma.$transaction(async (tx) => {
      if (Object.keys(data).length) {
        await tx.user.update({
          where: { id },
          data,
        });
      }

      if (managedStationId !== undefined) {
        await tx.stationManager.deleteMany({ where: { userId: id } });
        if (managedStationId !== null) {
          const station = await tx.station.findUnique({
            where: { id: managedStationId },
          });
          if (!station) {
            throw new BadRequestException('中转站不存在');
          }
          await tx.stationManager.create({
            data: {
              userId: id,
              stationId: managedStationId,
            },
          });
        }
      }
    });

    const updated = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            plants: true,
            plantHistories: true,
          },
        },
        stationManagers: {
          include: {
            station: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return this.toAdminUserDto(updated!);
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
      include: {
        _count: {
          select: {
            plants: true,
            bredPlants: true,
            posts: true,
            comments: true,
            likes: true,
            followings: true,
            followers: true,
            messages: true,
            sentTrades: true,
            receivedTrades: true,
            plantHistories: true,
            reports: true,
            stationManagers: true,
            conversations1: true,
            conversations2: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const totalAssociations = Object.values(user._count).reduce((sum, count) => sum + count, 0);
    if (totalAssociations > 0) {
      throw new BadRequestException('该用户有关联数据，无法删除');
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  private toAdminUserDto(user: {
    id: string;
    openid: string;
    nickname: string;
    avatar: string | null;
    city: string | null;
    bio: string | null;
    points: number;
    createdAt: Date;
    _count: { plants: number; plantHistories: number };
    stationManagers: Array<{
      station: { id: number; name: string };
    }>;
  }) {
    const managedStation = user.stationManagers[0]?.station || null;
    return {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar,
      city: user.city,
      bio: user.bio,
      points: user.points,
      plantCount: user._count.plants,
      historyCount: user._count.plantHistories,
      managedStationId: managedStation?.id ?? null,
      managedStationName: managedStation?.name ?? null,
      createdAt: user.createdAt,
    };
  }

  private async ensureUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }
}

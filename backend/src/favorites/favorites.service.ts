import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlantListStatus, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPlantDto, toStationDto } from '../common/mappers';
import { AddFavoriteDto, RemoveFavoriteDto } from './dto/favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: User) {
    const [plantFavorites, stationFavorites] = await Promise.all([
      this.prisma.plantFavorite.findMany({
        where: { userId: user.id },
        include: { plant: { include: { station: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stationFavorite.findMany({
        where: { userId: user.id },
        include: {
          station: {
            include: {
              _count: {
                select: {
                  plants: {
                    where: { listStatus: PlantListStatus.AVAILABLE },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      plants: plantFavorites.map((item) => ({
        ...toPlantDto(item.plant),
        favoritedAt: item.createdAt,
      })),
      stations: stationFavorites.map((item) => ({
        ...toStationDto(item.station),
        favoritedAt: item.createdAt,
      })),
    };
  }

  async checkPlant(user: User, plantId: string) {
    const favorite = await this.prisma.plantFavorite.findUnique({
      where: {
        userId_plantId: { userId: user.id, plantId },
      },
    });
    return { favorited: !!favorite };
  }

  async checkStation(user: User, stationId: number) {
    const favorite = await this.prisma.stationFavorite.findUnique({
      where: {
        userId_stationId: { userId: user.id, stationId },
      },
    });
    return { favorited: !!favorite };
  }

  async add(user: User, dto: AddFavoriteDto) {
    if (dto.targetType === 'plant') {
      return this.addPlant(user, dto.plantId);
    }
    return this.addStation(user, dto.stationId);
  }

  async remove(user: User, dto: RemoveFavoriteDto) {
    if (dto.targetType === 'plant') {
      return this.removePlant(user, dto.plantId);
    }
    return this.removeStation(user, dto.stationId);
  }

  private async addPlant(user: User, plantId?: string) {
    if (!plantId) {
      throw new BadRequestException('缺少 plantId');
    }

    const plant = await this.prisma.plant.findUnique({ where: { id: plantId } });
    if (!plant) {
      throw new NotFoundException('植物不存在');
    }

    await this.prisma.plantFavorite.upsert({
      where: {
        userId_plantId: { userId: user.id, plantId },
      },
      create: { userId: user.id, plantId },
      update: {},
    });

    return { favorited: true };
  }

  private async addStation(user: User, stationId?: number) {
    if (stationId == null) {
      throw new BadRequestException('缺少 stationId');
    }

    const station = await this.prisma.station.findUnique({
      where: { id: stationId },
    });
    if (!station) {
      throw new NotFoundException('中转站不存在');
    }

    await this.prisma.stationFavorite.upsert({
      where: {
        userId_stationId: { userId: user.id, stationId },
      },
      create: { userId: user.id, stationId },
      update: {},
    });

    return { favorited: true };
  }

  private async removePlant(user: User, plantId?: string) {
    if (!plantId) {
      throw new BadRequestException('缺少 plantId');
    }

    await this.prisma.plantFavorite.deleteMany({
      where: { userId: user.id, plantId },
    });

    return { favorited: false };
  }

  private async removeStation(user: User, stationId?: number) {
    if (stationId == null) {
      throw new BadRequestException('缺少 stationId');
    }

    await this.prisma.stationFavorite.deleteMany({
      where: { userId: user.id, stationId },
    });

    return { favorited: false };
  }
}

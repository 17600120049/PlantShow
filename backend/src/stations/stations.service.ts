import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PlantListStatus } from '@prisma/client';
import { GeocodingService } from '../common/geocoding.service';
import { PrismaService } from '../prisma/prisma.service';
import { toStationDto } from '../common/mappers';

@Injectable()
export class StationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocoding: GeocodingService,
  ) {}

  async findAll(activeOnly = false) {
    const stations = await this.prisma.station.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: {
            plants: {
              where: { listStatus: PlantListStatus.AVAILABLE },
            },
          },
        },
      },
    });

    const mapped = stations.map((station) => toStationDto(station));
    if (!activeOnly) {
      return mapped;
    }
    return mapped.filter((station) => station.isActive);
  }

  async findOne(id: number) {
    const station = await this.prisma.station.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            plants: {
              where: { listStatus: PlantListStatus.AVAILABLE },
            },
          },
        },
      },
    });

    if (!station) {
      throw new NotFoundException('中转站不存在');
    }

    return toStationDto(station);
  }

  async resolveNavigationTarget(id: number) {
    const station = await this.prisma.station.findUnique({ where: { id } });
    if (!station) {
      throw new NotFoundException('中转站不存在');
    }

    const geocoded = await this.geocoding.geocodeAddress(station.address);
    if (!geocoded) {
      throw new BadRequestException(
        '无法根据地址搜索到位置，请填写更完整的地址或检查地图 API Key 配置',
      );
    }

    return {
      id: station.id,
      address: station.address,
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
    };
  }
}

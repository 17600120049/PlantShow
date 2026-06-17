import { Injectable, NotFoundException } from '@nestjs/common';
import { PlantListStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toStationDto } from '../common/mappers';

@Injectable()
export class StationsService {
  constructor(private readonly prisma: PrismaService) {}

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
}

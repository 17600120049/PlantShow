import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlantListStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toStationDto } from '../common/mappers';
import { CreateStationDto, UpdateStationDto } from './dto/station.dto';

@Injectable()
export class AdminStationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const stations = await this.prisma.station.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: {
            plants: { where: { listStatus: PlantListStatus.AVAILABLE } },
          },
        },
      },
    });
    return stations.map((s) => toStationDto(s));
  }

  async create(dto: CreateStationDto) {
    const station = await this.prisma.station.create({
      data: {
        stationCode: dto.stationCode,
        name: dto.name,
        address: dto.address,
        hours: dto.hours,
        phone: dto.phone,
        imageEmoji: dto.imageEmoji || '🏡',
      },
      include: {
        _count: {
          select: {
            plants: { where: { listStatus: PlantListStatus.AVAILABLE } },
          },
        },
      },
    });
    return toStationDto(station);
  }

  async update(id: number, dto: UpdateStationDto) {
    await this.ensureStation(id);
    const station = await this.prisma.station.update({
      where: { id },
      data: dto,
      include: {
        _count: {
          select: {
            plants: { where: { listStatus: PlantListStatus.AVAILABLE } },
          },
        },
      },
    });
    return toStationDto(station);
  }

  async remove(id: number) {
    const count = await this.prisma.plant.count({ where: { stationId: id } });
    if (count > 0) {
      throw new BadRequestException('驿站下仍有植物，无法删除');
    }
    await this.prisma.station.delete({ where: { id } });
    return { success: true };
  }

  private async ensureStation(id: number) {
    const station = await this.prisma.station.findUnique({ where: { id } });
    if (!station) {
      throw new NotFoundException('驿站不存在');
    }
    return station;
  }
}

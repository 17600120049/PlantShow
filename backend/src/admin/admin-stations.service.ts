import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlantListStatus } from '@prisma/client';
import { GeocodingService } from '../common/geocoding.service';
import { PrismaService } from '../prisma/prisma.service';
import { toStationDto } from '../common/mappers';
import { CreateStationDto, UpdateStationDto } from './dto/station.dto';

@Injectable()
export class AdminStationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocoding: GeocodingService,
  ) {}

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
    await this.ensureAddressSearchable(dto.address);

    const station = await this.prisma.station.create({
      data: {
        stationCode: dto.stationCode,
        name: dto.name,
        address: dto.address,
        hours: dto.hours,
        phone: dto.phone,
        logoUrl: dto.logoUrl,
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
    const existing = await this.ensureStation(id);

    if (dto.address && dto.address !== existing.address) {
      await this.ensureAddressSearchable(dto.address);
    }

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
      throw new BadRequestException('中转站下仍有植物，无法删除');
    }
    await this.prisma.station.delete({ where: { id } });
    return { success: true };
  }

  private async ensureStation(id: number) {
    const station = await this.prisma.station.findUnique({ where: { id } });
    if (!station) {
      throw new NotFoundException('中转站不存在');
    }
    return station;
  }

  private async ensureAddressSearchable(address: string) {
    const geocoded = await this.geocoding.geocodeAddress(address);
    if (!geocoded) {
      throw new BadRequestException(
        '无法根据该地址搜索到位置，请填写更完整的地址或检查地图 API Key 配置',
      );
    }
  }
}

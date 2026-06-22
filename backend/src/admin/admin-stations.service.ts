import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlantListStatus, StationHoursMode } from '@prisma/client';
import { GeocodingService } from '../common/geocoding.service';
import { normalizeStationHoursInput } from '../common/station-hours';
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
    const geocoded = await this.ensureAddressSearchable(dto.address);

    const hoursMode = dto.hoursMode || StationHoursMode.FIXED;
    const normalizedHours = normalizeStationHoursInput(hoursMode, dto.hours);
    if (hoursMode === StationHoursMode.FIXED && !normalizedHours.hours) {
      throw new BadRequestException('固定营业时间需填写时间段，如 09:00-20:00');
    }

    const station = await this.prisma.station.create({
      data: {
        stationCode: dto.stationCode,
        name: dto.name,
        address: dto.address,
        hours: normalizedHours.hours,
        hoursMode: normalizedHours.hoursMode,
        contactType: dto.contactType,
        phone: dto.phone,
        logoUrl: dto.logoUrl,
        latitude: geocoded?.latitude,
        longitude: geocoded?.longitude,
        isActive: true,
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

    const nextHoursMode = dto.hoursMode || existing.hoursMode;
    const normalizedHours = normalizeStationHoursInput(
      nextHoursMode,
      dto.hours ?? existing.hours,
    );
    if (nextHoursMode === StationHoursMode.FIXED && !normalizedHours.hours) {
      throw new BadRequestException('固定营业时间需填写时间段，如 09:00-20:00');
    }

    let latitude = existing.latitude;
    let longitude = existing.longitude;
    if (dto.address && dto.address !== existing.address) {
      const geocoded = await this.geocoding.geocodeAddress(dto.address);
      if (geocoded) {
        latitude = geocoded.latitude;
        longitude = geocoded.longitude;
      }
    }

    const station = await this.prisma.station.update({
      where: { id },
      data: {
        stationCode: dto.stationCode,
        name: dto.name,
        address: dto.address,
        hours: normalizedHours.hours,
        hoursMode: normalizedHours.hoursMode,
        contactType: dto.contactType,
        phone: dto.phone,
        logoUrl: dto.logoUrl,
        latitude,
        longitude,
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

  async remove(id: number) {
    await this.ensureStation(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.plant.updateMany({
        where: { stationId: id },
        data: {
          stationId: null,
          listStatus: PlantListStatus.NONE,
          listedAt: null,
        },
      });
      await tx.station.delete({ where: { id } });
    });

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
    return geocoded;
  }
}

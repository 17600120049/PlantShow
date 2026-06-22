import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Plant, PlantListStatus, PlantStatus, Station, StationHoursMode, User } from '@prisma/client';
import { GeocodingService } from '../common/geocoding.service';
import {
  detectAtStation,
  isAutoCloseExpired,
} from '../common/station-auto-status';
import { toPlantDto, toStationDto, toStationAutoStatusFields } from '../common/mappers';
import { photosToPrismaJson } from '../common/plant-photos';
import {
  isFlexibleHoursMode,
  normalizeStationHoursInput,
} from '../common/station-hours';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateManagedPlantDto } from './dto/update-managed-plant.dto';
import { UpdateManagedStationDto } from './dto/update-managed-station.dto';
import { SyncStationOpenStatusDto } from './dto/sync-station-open-status.dto';

export type OpenStatusSyncReason =
  | 'timeout'
  | 'wifi'
  | 'location'
  | 'unchanged'
  | 'inconclusive'
  | 'disabled';

export type OpenStatusSyncResult = {
  changed: boolean;
  reason: OpenStatusSyncReason;
  detectedAtStation: boolean | null;
  message: string;
};

const stationInclude = {
  _count: {
    select: {
      plants: {
        where: { listStatus: PlantListStatus.AVAILABLE },
      },
    },
  },
} as const;

@Injectable()
export class StationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocoding: GeocodingService,
  ) {}

  async findAll(activeOnly = false) {
    const stations = await this.prisma.station.findMany({
      orderBy: { id: 'asc' },
      include: stationInclude,
    });

    const refreshed = await Promise.all(
      stations.map((station) => this.refreshFlexibleStationRecord(station)),
    );

    const mapped = refreshed.map((station) => toStationDto(station));
    if (!activeOnly) {
      return mapped;
    }
    return mapped.filter((station) => station.isActive);
  }

  async findOne(id: number) {
    const station = await this.ensureStationRecord(id);
    const refreshed = await this.refreshFlexibleStationRecord(station);
    return toStationDto(refreshed);
  }

  async getManagerAccess(stationId: number, userId?: string) {
    const stationRecord = await this.ensureStationRecord(stationId);
    const refreshed = await this.refreshFlexibleStationRecord(stationRecord);
    const station = toStationDto(refreshed);
    const isManager = userId
      ? await this.isUserManager(userId, stationId)
      : false;

    return {
      ...station,
      ...toStationAutoStatusFields(refreshed),
      isManager,
      canToggleStatus: isManager && station.isFlexibleHours,
    };
  }

  async findManagedByUser(userId: string) {
    const records = await this.prisma.stationManager.findMany({
      where: { userId },
      include: {
        station: {
          include: stationInclude,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const refreshed = await Promise.all(
      records.map((record) => this.refreshFlexibleStationRecord(record.station)),
    );

    return refreshed.map((station, index) => ({
      ...toStationDto(station),
      ...toStationAutoStatusFields(station),
      isManager: true,
      canToggleStatus: isFlexibleHoursMode(station.hoursMode),
    }));
  }

  async setOpenStatus(user: User, stationId: number, isActive: boolean) {
    const station = await this.ensureStationRecord(stationId);

    if (!isFlexibleHoursMode(station.hoursMode)) {
      throw new BadRequestException('该中转站为固定营业时间，状态将根据时间自动计算');
    }
    if (!(await this.isUserManager(user.id, stationId))) {
      throw new ForbiddenException('您不是该中转站的管理员');
    }

    const updated = await this.prisma.station.update({
      where: { id: stationId },
      data: {
        isActive,
        lastOpenConfirmedAt: isActive ? new Date() : null,
      },
      include: stationInclude,
    });

    return this.buildManagerAccessDto(updated);
  }

  async syncOpenStatus(
    userId: string,
    stationId: number,
    dto: SyncStationOpenStatusDto,
  ) {
    await this.ensureUserIsManager(userId, stationId);
    const station = await this.ensureStationRecord(stationId);

    if (!isFlexibleHoursMode(station.hoursMode)) {
      throw new BadRequestException('该中转站为固定营业时间，无需同步营业状态');
    }

    const { station: updated, sync } = await this.applyAutoStatusSync(station, dto);
    return {
      ...this.buildManagerAccessDto(updated),
      sync,
    };
  }

  async syncManagedOpenStatus(userId: string, dto: SyncStationOpenStatusDto) {
    const records = await this.prisma.stationManager.findMany({
      where: { userId },
      include: { station: { include: stationInclude } },
      orderBy: { createdAt: 'asc' },
    });

    const results: Array<
      ReturnType<typeof toStationDto> &
        ReturnType<typeof toStationAutoStatusFields> & {
          isManager: true;
          canToggleStatus: true;
          sync: OpenStatusSyncResult;
        }
    > = [];
    for (const record of records) {
      if (!isFlexibleHoursMode(record.station.hoursMode)) {
        continue;
      }

      const { station, sync } = await this.applyAutoStatusSync(record.station, dto);
      results.push({
        ...toStationDto(station),
        ...toStationAutoStatusFields(station),
        isManager: true,
        canToggleStatus: true,
        sync,
      });
    }

    return { stations: results };
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

  async isUserManager(userId: string, stationId: number) {
    const record = await this.prisma.stationManager.findUnique({
      where: {
        userId_stationId: {
          userId,
          stationId,
        },
      },
    });
    return !!record;
  }

  async ensureUserIsManager(userId: string, stationId: number) {
    if (!(await this.isUserManager(userId, stationId))) {
      throw new ForbiddenException('您不是该中转站的管理员');
    }
  }

  async updateManaged(userId: string, stationId: number, dto: UpdateManagedStationDto) {
    await this.ensureUserIsManager(userId, stationId);
    const existing = await this.ensureStationRecord(stationId);

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

    const updated = await this.prisma.station.update({
      where: { id: stationId },
      data: {
        name: dto.name,
        address: dto.address,
        hours: normalizedHours.hours,
        hoursMode: normalizedHours.hoursMode,
        contactType: dto.contactType,
        phone: dto.phone,
        logoUrl: dto.logoUrl,
        wifiSsid: dto.wifiSsid === undefined ? undefined : dto.wifiSsid || null,
        autoOpenRadiusM: dto.autoOpenRadiusM,
        autoCloseHours: dto.autoCloseHours,
        autoStatusEnabled: dto.autoStatusEnabled,
        latitude,
        longitude,
      },
      include: stationInclude,
    });

    return this.getManagerAccess(stationId, userId);
  }

  async findManagedPlants(userId: string, stationId: number) {
    await this.ensureUserIsManager(userId, stationId);
    await this.ensureStationRecord(stationId);

    const plants = await this.prisma.plant.findMany({
      where: { stationId },
      include: {
        station: true,
        breeder: { select: { nickname: true } },
      },
      orderBy: [{ listStatus: 'desc' }, { listedAt: 'desc' }],
    });

    return plants.map(toPlantDto);
  }

  async updateManagedPlant(
    userId: string,
    stationId: number,
    plantId: string,
    dto: UpdateManagedPlantDto,
  ) {
    await this.ensureUserIsManager(userId, stationId);

    const plant = await this.prisma.plant.findUnique({
      where: { id: plantId },
      include: { station: true, breeder: { select: { nickname: true } } },
    });

    if (!plant) {
      throw new NotFoundException('植物不存在');
    }
    if (plant.stationId !== stationId) {
      throw new ForbiddenException('该植物不属于此中转站');
    }
    if (plant.status === PlantStatus.ADOPTED) {
      throw new BadRequestException('已领养的植物不可编辑');
    }

    if (dto.listStatus === PlantListStatus.AVAILABLE && !plant.stationId) {
      throw new BadRequestException('待领养植物必须关联中转站');
    }

    const updated = await this.prisma.plant.update({
      where: { id: plantId },
      data: {
        name: dto.name,
        species: dto.species,
        description: dto.description,
        photos: dto.photos !== undefined ? photosToPrismaJson(dto.photos) : undefined,
        listStatus: dto.listStatus,
        listedAt:
          dto.listStatus === PlantListStatus.AVAILABLE && plant.listStatus !== PlantListStatus.AVAILABLE
            ? new Date()
            : dto.listStatus === PlantListStatus.NONE
              ? null
              : undefined,
      },
      include: { station: true, breeder: { select: { nickname: true } } },
    });

    return toPlantDto(updated);
  }

  private buildManagerAccessDto(
    station: Station & { _count?: { plants: number } },
  ) {
    const dto = toStationDto(station);
    return {
      ...dto,
      ...toStationAutoStatusFields(station),
      isManager: true,
      canToggleStatus: dto.isFlexibleHours,
    };
  }

  private async refreshFlexibleStationRecord(
    station: Station & { _count?: { plants: number } },
  ) {
    if (!isFlexibleHoursMode(station.hoursMode)) {
      return station;
    }

    let current = station;
    if (current.isActive && !current.lastOpenConfirmedAt) {
      current = await this.prisma.station.update({
        where: { id: current.id },
        data: { lastOpenConfirmedAt: current.updatedAt || new Date() },
        include: stationInclude,
      });
    }

    if (
      current.isActive &&
      isAutoCloseExpired(current.lastOpenConfirmedAt, current.autoCloseHours)
    ) {
      return this.prisma.station.update({
        where: { id: current.id },
        data: { isActive: false, lastOpenConfirmedAt: null },
        include: stationInclude,
      });
    }

    return current;
  }

  private async applyAutoStatusSync(
    station: Station & { _count?: { plants: number } },
    dto: SyncStationOpenStatusDto,
  ): Promise<{
    station: Station & { _count?: { plants: number } };
    sync: OpenStatusSyncResult;
  }> {
    let current = await this.refreshFlexibleStationRecord(station);

    if (!current.autoStatusEnabled) {
      return {
        station: current,
        sync: {
          changed: false,
          reason: 'disabled',
          detectedAtStation: null,
          message: '已关闭自动同步，请手动切换营业状态',
        },
      };
    }

    const detection = detectAtStation(current, dto);
    if (detection.atStation === null) {
      return {
        station: current,
        sync: {
          changed: false,
          reason: 'inconclusive',
          detectedAtStation: null,
          message: '未能获取 WiFi 或定位信息，状态保持不变',
        },
      };
    }

    if (detection.atStation) {
      const shouldOpen = !current.isActive;
      const shouldRefresh = current.isActive;
      if (shouldOpen || shouldRefresh) {
        current = await this.prisma.station.update({
          where: { id: current.id },
          data: {
            isActive: true,
            lastOpenConfirmedAt: new Date(),
          },
          include: stationInclude,
        });
        return {
          station: current,
          sync: {
            changed: shouldOpen,
            reason: detection.method === 'wifi' ? 'wifi' : 'location',
            detectedAtStation: true,
            message: shouldOpen ? '检测到您已到店，已自动设为营业中' : '已确认您在店，营业状态已刷新',
          },
        };
      }

      return {
        station: current,
        sync: {
          changed: false,
          reason: detection.method === 'wifi' ? 'wifi' : 'location',
          detectedAtStation: true,
          message: '检测到您在中转站附近，当前为营业中',
        },
      };
    }

    if (current.isActive) {
      current = await this.prisma.station.update({
        where: { id: current.id },
        data: { isActive: false, lastOpenConfirmedAt: null },
        include: stationInclude,
      });
      return {
        station: current,
        sync: {
          changed: true,
          reason: detection.method === 'wifi' ? 'wifi' : 'location',
          detectedAtStation: false,
          message: '检测到您已离开中转站，已自动设为休息中',
        },
      };
    }

    return {
      station: current,
      sync: {
        changed: false,
        reason: detection.method === 'wifi' ? 'wifi' : 'location',
        detectedAtStation: false,
        message: '检测到您不在中转站，当前为休息中',
      },
    };
  }

  private async ensureAddressSearchable(address: string) {
    const geocoded = await this.geocoding.geocodeAddress(address);
    if (!geocoded) {
      throw new BadRequestException(
        '无法根据该地址搜索到位置，请填写更完整的地址或检查地图 API Key 配置',
      );
    }
  }

  private async ensureStationRecord(id: number) {
    const station = await this.prisma.station.findUnique({
      where: { id },
      include: stationInclude,
    });

    if (!station) {
      throw new NotFoundException('中转站不存在');
    }

    return station;
  }
}

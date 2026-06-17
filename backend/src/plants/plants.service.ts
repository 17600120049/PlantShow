import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  HistoryAction,
  PlantListStatus,
  PlantStatus,
  User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isStationOpenByHours } from '../common/station-hours';
import { DONATE_POINTS, toPlantDto } from '../common/mappers';
import { photosToPrismaJson, normalizePhotosInput, getPlantCoverPhoto } from '../common/plant-photos';
import { DonatePlantDto } from './dto/donate-plant.dto';

@Injectable()
export class PlantsService {
  constructor(private readonly prisma: PrismaService) {}

  generatePlantCode() {
    const suffix = Date.now().toString(36).toUpperCase().slice(-6);
    return `PW-${suffix}`;
  }

  async findListed() {
    const plants = await this.prisma.plant.findMany({
      where: { listStatus: PlantListStatus.AVAILABLE },
      include: { station: true },
      orderBy: { listedAt: 'desc' },
    });
    return plants.map(toPlantDto);
  }

  async findAvailableByStation(stationId: number) {
    const station = await this.prisma.station.findUnique({ where: { id: stationId } });
    if (!station) {
      throw new NotFoundException('中转站不存在');
    }

    const plants = await this.prisma.plant.findMany({
      where: {
        stationId,
        listStatus: PlantListStatus.AVAILABLE,
      },
      include: { station: true },
      orderBy: { listedAt: 'desc' },
    });

    return plants.map(toPlantDto);
  }

  async findByCode(plantCode: string) {
    const plant = await this.prisma.plant.findUnique({
      where: { plantCode: plantCode.toUpperCase() },
      include: { station: true },
    });

    if (!plant) {
      throw new NotFoundException('植物不存在');
    }

    return toPlantDto(plant);
  }

  async findOne(id: string) {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
      include: { station: true },
    });

    if (!plant) {
      throw new NotFoundException('植物不存在');
    }

    return toPlantDto(plant);
  }

  async donate(user: User, dto: DonatePlantDto) {
    const station = await this.prisma.station.findUnique({
      where: { id: dto.stationId },
    });

    if (!station) {
      throw new NotFoundException('中转站不存在');
    }
    if (!isStationOpenByHours(station.hours)) {
      throw new BadRequestException('该中转站当前不在营业时间内，请选择其他中转站');
    }

    const plantCode = (dto.plantCode || this.generatePlantCode()).toUpperCase();
    const existing = await this.prisma.plant.findUnique({
      where: { plantCode },
      include: { station: true },
    });

    if (existing?.listStatus === PlantListStatus.AVAILABLE) {
      throw new BadRequestException('该植物已在中转站待领养中');
    }

    const now = new Date();
    const donatePhotos = normalizePhotosInput(
      dto.photos?.length ? dto.photos : dto.photoUrl ? [dto.photoUrl] : [],
    );
    const coverPhoto = donatePhotos[0] || null;

    const result = await this.prisma.$transaction(async (tx) => {
      let plant;

      if (existing) {
        plant = await tx.plant.update({
          where: { id: existing.id },
          data: {
            name: dto.name,
            species: dto.category,
            description: dto.description,
            imageEmoji: dto.image || existing.imageEmoji || '🌿',
            photos: photosToPrismaJson(
              donatePhotos.length ? donatePhotos : undefined,
            ),
            stationId: station.id,
            listStatus: PlantListStatus.AVAILABLE,
            listedAt: now,
            status: PlantStatus.ACTIVE,
            currentOwnerId: user.id,
          },
          include: { station: true },
        });
      } else {
        plant = await tx.plant.create({
          data: {
            plantCode,
            name: dto.name,
            species: dto.category,
            source: 'donation',
            breederId: user.id,
            currentOwnerId: user.id,
            description: dto.description,
            imageEmoji: dto.image || '🌿',
            photos: photosToPrismaJson(donatePhotos),
            stationId: station.id,
            listStatus: PlantListStatus.AVAILABLE,
            listedAt: now,
            status: PlantStatus.ACTIVE,
          },
          include: { station: true },
        });
      }

      await tx.plantHistory.create({
        data: {
          plantId: plant.id,
          ownerId: user.id,
          action: HistoryAction.GIFT,
          note: `送养至 ${station.name}`,
          photoUrl: coverPhoto || getPlantCoverPhoto(plant),
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { points: { increment: DONATE_POINTS } },
      });

      return { plant, updatedUser };
    });

    return {
      success: true,
      plant: toPlantDto(result.plant),
      station: {
        id: station.id,
        name: station.name,
        address: station.address,
      },
      points: DONATE_POINTS,
      totalPoints: result.updatedUser.points,
      qrPath: `/api/qr/plant/${result.plant.plantCode}`,
    };
  }

  async adopt(user: User, plantId: string) {
    const plant = await this.prisma.plant.findUnique({
      where: { id: plantId },
      include: { station: true },
    });

    if (!plant) {
      throw new NotFoundException('植物不存在');
    }
    if (plant.listStatus !== PlantListStatus.AVAILABLE) {
      throw new BadRequestException('该植物已被领养');
    }

    const now = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const adoptedPlant = await tx.plant.update({
        where: { id: plant.id },
        data: {
          currentOwnerId: user.id,
          listStatus: PlantListStatus.NONE,
          stationId: null,
          status: PlantStatus.ADOPTED,
          adoptedAt: now,
          wanderCount: { increment: 1 },
        },
        include: { station: true },
      });

      await tx.plantHistory.create({
        data: {
          plantId: plant.id,
          ownerId: user.id,
          action: HistoryAction.ADOPT,
          note: plant.station ? `从 ${plant.station.name} 领养` : '扫码领养',
        },
      });

      return adoptedPlant;
    });

    const station = plant.station;

    return {
      success: true,
      plant: toPlantDto({ ...updated, station: null }),
      station: station
        ? {
            id: station.id,
            name: station.name,
            address: station.address,
          }
        : null,
    };
  }
}

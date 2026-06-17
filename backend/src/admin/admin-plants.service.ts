import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PlantListStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPlantDto } from '../common/mappers';
import { photosToPrismaJson } from '../common/plant-photos';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Injectable()
export class AdminPlantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    keyword?: string;
    listStatus?: PlantListStatus;
    stationId?: number;
  }) {
    const where: Prisma.PlantWhereInput = {};

    if (params?.keyword) {
      where.OR = [
        { name: { contains: params.keyword } },
        { plantCode: { contains: params.keyword } },
        { species: { contains: params.keyword } },
      ];
    }
    if (params?.listStatus) {
      where.listStatus = params.listStatus;
    }
    if (params?.stationId) {
      where.stationId = params.stationId;
    }

    const plants = await this.prisma.plant.findMany({
      where,
      include: {
        station: true,
        owner: { select: { id: true, nickname: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return plants.map((plant) => ({
      ...toPlantDto(plant),
      ownerName: plant.owner.nickname,
      ownerId: plant.owner.id,
    }));
  }

  async update(id: string, dto: UpdatePlantDto) {
    await this.ensurePlant(id);

    if (dto.listStatus === PlantListStatus.AVAILABLE && dto.stationId === undefined) {
      const current = await this.prisma.plant.findUnique({ where: { id } });
      if (!current?.stationId) {
        throw new BadRequestException('待领养植物必须关联中转站');
      }
    }

    const plant = await this.prisma.plant.update({
      where: { id },
      data: {
        name: dto.name,
        species: dto.species,
        description: dto.description,
        photos: photosToPrismaJson(dto.photos),
        photoUrl: dto.photos === undefined ? undefined : dto.photos[0] || null,
        status: dto.status,
        listStatus: dto.listStatus,
        stationId: dto.stationId === undefined ? undefined : dto.stationId,
      },
      include: { station: true, owner: { select: { nickname: true, id: true } } },
    });

    return {
      ...toPlantDto(plant),
      ownerName: plant.owner.nickname,
      ownerId: plant.owner.id,
    };
  }

  async remove(id: string) {
    await this.ensurePlant(id);
    await this.prisma.plantHistory.deleteMany({ where: { plantId: id } });
    await this.prisma.plant.delete({ where: { id } });
    return { success: true };
  }

  private async ensurePlant(id: string) {
    const plant = await this.prisma.plant.findUnique({ where: { id } });
    if (!plant) {
      throw new NotFoundException('植物不存在');
    }
    return plant;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Plant, PlantStatus, HistoryAction } from '@prisma/client';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Injectable()
export class PlantService {

  private generatePlantCode(): string {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 9000) + 1000;
    const checksum = (parseInt(year) + random) % 26;
    const checkChar = String.fromCharCode(65 + checksum);
    return `PLT-${year}-${random}-${checkChar}`;
  }

  async create(createPlantDto: CreatePlantDto, userId: string): Promise<Plant> {
    const plantCode = this.generatePlantCode();
    
    const plant = await PrismaService.prisma.plant.create({
      data: {
        ...createPlantDto,
        plantCode,
        breederId: userId,
        currentOwnerId: userId,
        histories: {
          create: {
            ownerId: userId,
            action: HistoryAction.ADOPT,
            note: '首次领养',
          },
        },
      },
    });

    return plant;
  }

  async findAll(status?: PlantStatus): Promise<Plant[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    
    return PrismaService.prisma.plant.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        breeder: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Plant | null> {
    return PrismaService.prisma.plant.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        breeder: {
          select: {
            id: true,
            nickname: true,
          },
        },
        histories: {
          include: {
            owner: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });
  }

  async update(id: string, updatePlantDto: UpdatePlantDto): Promise<Plant> {
    return PrismaService.prisma.plant.update({
      where: { id },
      data: updatePlantDto,
    });
  }

  async updateOwner(plantId: string, newOwnerId: string, action: HistoryAction, note?: string): Promise<Plant> {
    const plant = await PrismaService.prisma.plant.findUnique({
      where: { id: plantId },
    });

    if (!plant) {
      throw new Error('Plant not found');
    }

    return PrismaService.prisma.plant.update({
      where: { id: plantId },
      data: {
        currentOwnerId: newOwnerId,
        wanderCount: plant.wanderCount + 1,
        histories: {
          create: {
            ownerId: newOwnerId,
            action,
            note,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<Plant> {
    return PrismaService.prisma.plant.delete({
      where: { id },
    });
  }

  async getPlantsByUser(userId: string): Promise<Plant[]> {
    return PrismaService.prisma.plant.findMany({
      where: { currentOwnerId: userId },
      include: {
        histories: true,
      },
    });
  }
}

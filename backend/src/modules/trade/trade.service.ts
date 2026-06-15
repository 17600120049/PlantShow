import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Trade, TradeType, TradeStatus, HistoryAction, Plant } from '@prisma/client';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';

@Injectable()
export class TradeService {

  async create(createTradeDto: CreateTradeDto, userId: string): Promise<Trade> {
    const plant = await PrismaService.prisma.plant.findUnique({
      where: { id: createTradeDto.plantId },
    });

    if (!plant) {
      throw new Error('Plant not found');
    }

    if (plant.currentOwnerId !== userId) {
      throw new Error('You are not the owner of this plant');
    }

    return PrismaService.prisma.trade.create({
      data: {
        plantId: createTradeDto.plantId,
        ownerId: userId,
        receiverId: createTradeDto.receiverId,
        type: createTradeDto.type,
        offerContent: createTradeDto.offerContent,
      },
    });
  }

  async findAll(userId?: string): Promise<Trade[]> {
    const where: any = {};
    if (userId) {
      where.OR = [
        { ownerId: userId },
        { receiverId: userId },
      ];
    }

    return PrismaService.prisma.trade.findMany({
      where,
      include: {
        plant: {
          select: {
            id: true,
            name: true,
            species: true,
            plantCode: true,
          },
        },
        owner: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Trade | null> {
    return PrismaService.prisma.trade.findUnique({
      where: { id },
      include: {
        plant: {
          select: {
            id: true,
            name: true,
            species: true,
            plantCode: true,
            currentOwnerId: true,
          },
        },
        owner: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });
  }

  async update(id: string, updateTradeDto: UpdateTradeDto, userId: string): Promise<Trade> {
    const trade = await PrismaService.prisma.trade.findUnique({
      where: { id },
      include: { plant: true },
    });

    if (!trade) {
      throw new Error('Trade not found');
    }

    if (trade.receiverId !== userId) {
      throw new Error('Only receiver can accept/reject');
    }

    if (updateTradeDto.status === TradeStatus.ACCEPTED) {
      await PrismaService.prisma.plant.update({
        where: { id: trade.plantId },
        data: {
          currentOwnerId: userId,
          wanderCount: (trade.plant as Plant).wanderCount + 1,
          histories: {
            create: {
              ownerId: userId,
              action: trade.type === TradeType.FREE ? HistoryAction.GIFT : HistoryAction.TRADE,
              note: '交换完成',
            },
          },
        },
      });
    }

    return PrismaService.prisma.trade.update({
      where: { id },
      data: {
        ...updateTradeDto,
        completedAt: updateTradeDto.status !== TradeStatus.PENDING ? new Date() : undefined,
      },
    });
  }

  async remove(id: string, userId: string): Promise<Trade> {
    const trade = await PrismaService.prisma.trade.findUnique({
      where: { id },
    });

    if (!trade) {
      throw new Error('Trade not found');
    }

    if (trade.ownerId !== userId && trade.receiverId !== userId) {
      throw new Error('Unauthorized');
    }

    return PrismaService.prisma.trade.delete({
      where: { id },
    });
  }
}

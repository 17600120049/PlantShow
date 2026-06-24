import { Injectable } from '@nestjs/common';
import { HistoryAction, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DONATE_POINTS,
  formatDate,
  formatDateTime,
  getEffectivePoints,
  getLockedPoints,
  toPlantDto,
} from '../common/mappers';
import { UpdateProfileDto } from './dto/update-profile.dto';

const plantHistoryInclude = {
  plant: {
    include: {
      station: true,
      breeder: { select: { nickname: true } },
      histories: {
        where: { action: HistoryAction.GIFT },
        orderBy: { timestamp: 'desc' as const },
        take: 1,
        include: { owner: { select: { nickname: true } } },
      },
    },
  },
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(user: User, dto: UpdateProfileDto) {
    const data: { nickname?: string; avatar?: string } = {};
    if (dto.nickname !== undefined) {
      data.nickname = dto.nickname.trim();
    }
    if (dto.avatar !== undefined) {
      data.avatar = dto.avatar;
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data,
    });
  }

  async getStats(user: User) {
    const [donatedCount, adoptedCount] = await Promise.all([
      this.prisma.plantHistory.count({
        where: { ownerId: user.id, action: 'GIFT' },
      }),
      this.prisma.plantHistory.count({
        where: { ownerId: user.id, action: 'ADOPT' },
      }),
    ]);

    return {
      donatedCount,
      adoptedCount,
      points: getEffectivePoints(user),
      lockedPoints: getLockedPoints(user),
      inviteUnlocked: user.inviteUnlocked,
    };
  }

  async getDonations(user: User) {
    const histories = await this.prisma.plantHistory.findMany({
      where: { ownerId: user.id, action: HistoryAction.GIFT },
      include: plantHistoryInclude,
      orderBy: { timestamp: 'desc' },
    });

    return histories.map((history) => ({
      id: history.id,
      time: formatDate(history.timestamp),
      timeDetail: formatDateTime(history.timestamp),
      note: history.note || '',
      points: DONATE_POINTS,
      plant: toPlantDto(history.plant),
    }));
  }

  async getAdoptions(user: User) {
    const histories = await this.prisma.plantHistory.findMany({
      where: { ownerId: user.id, action: HistoryAction.ADOPT },
      include: plantHistoryInclude,
      orderBy: { timestamp: 'desc' },
    });

    return histories.map((history) => ({
      id: history.id,
      time: formatDate(history.timestamp),
      timeDetail: formatDateTime(history.timestamp),
      note: history.note || '',
      plant: toPlantDto(history.plant),
    }));
  }

  async getPointsHistory(user: User) {
    const histories = await this.prisma.plantHistory.findMany({
      where: { ownerId: user.id, action: HistoryAction.GIFT },
      include: {
        plant: { select: { name: true, plantCode: true } },
      },
      orderBy: { timestamp: 'desc' },
    });

    const records = histories.map((history) => ({
      id: history.id,
      type: 'earn',
      delta: DONATE_POINTS,
      title: '送养植物',
      description: `送养「${history.plant.name}」`,
      note: history.note || '',
      time: formatDate(history.timestamp),
      timeDetail: formatDateTime(history.timestamp),
    }));

    const earnedFromDonations = histories.length * DONATE_POINTS;
    const welcomePoints = Math.max(0, user.points - earnedFromDonations);
    if (welcomePoints > 0) {
      records.unshift({
        id: 'welcome-bonus',
        type: 'earn',
        delta: welcomePoints,
        title: '新用户注册奖励',
        description: user.inviteUnlocked
          ? '欢迎加入 PlantShow'
          : '邀请好友注册后解锁',
        note: user.inviteUnlocked ? '' : '待解锁',
        time: formatDate(user.createdAt),
        timeDetail: formatDateTime(user.createdAt),
      });
    }

    return {
      totalPoints: getEffectivePoints(user),
      lockedPoints: getLockedPoints(user),
      inviteUnlocked: user.inviteUnlocked,
      records,
    };
  }
}

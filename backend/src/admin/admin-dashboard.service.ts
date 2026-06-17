import { Injectable } from '@nestjs/common';
import { PlantListStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      userCount,
      stationCount,
      plantCount,
      availablePlants,
      pointsAggregate,
      donationCount,
      adoptionCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.station.count(),
      this.prisma.plant.count(),
      this.prisma.plant.count({ where: { listStatus: PlantListStatus.AVAILABLE } }),
      this.prisma.user.aggregate({ _sum: { points: true } }),
      this.prisma.plantHistory.count({ where: { action: 'GIFT' } }),
      this.prisma.plantHistory.count({ where: { action: 'ADOPT' } }),
    ]);

    return {
      userCount,
      stationCount,
      plantCount,
      availablePlants,
      totalPoints: pointsAggregate._sum.points || 0,
      donationCount,
      adoptionCount,
    };
  }
}

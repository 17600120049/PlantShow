import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
      points: user.points,
      currentReservation: 0,
    };
  }
}

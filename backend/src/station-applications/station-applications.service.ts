import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStationApplicationDto } from './dto/create-station-application.dto';

@Injectable()
export class StationApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User | null, dto: CreateStationApplicationDto) {
    const application = await this.prisma.stationApplication.create({
      data: {
        userId: user?.id ?? null,
        applicantName: dto.applicantName.trim(),
        phone: dto.phone.trim(),
        stationName: dto.stationName.trim(),
        address: dto.address.trim(),
        hours: dto.hours?.trim() || null,
        intro: dto.intro?.trim() || null,
      },
    });

    return {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
    };
  }
}

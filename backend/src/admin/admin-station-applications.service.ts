import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StationApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewStationApplicationDto } from './dto/review-station-application.dto';

function toApplicationDto(application: {
  id: string;
  applicantName: string;
  phone: string;
  stationName: string;
  address: string;
  hours: string | null;
  intro: string | null;
  status: StationApplicationStatus;
  reviewNote: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  user: { id: string; nickname: string } | null;
}) {
  return {
    id: application.id,
    applicantName: application.applicantName,
    phone: application.phone,
    stationName: application.stationName,
    address: application.address,
    hours: application.hours,
    intro: application.intro,
    status: application.status,
    reviewNote: application.reviewNote,
    reviewedAt: application.reviewedAt,
    createdAt: application.createdAt,
    userId: application.user?.id ?? null,
    userNickname: application.user?.nickname ?? null,
  };
}

@Injectable()
export class AdminStationApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: StationApplicationStatus) {
    const applications = await this.prisma.stationApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true } },
      },
    });
    return applications.map(toApplicationDto);
  }

  async review(id: string, dto: ReviewStationApplicationDto) {
    const existing = await this.prisma.stationApplication.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('申请不存在');
    }
    if (existing.status !== StationApplicationStatus.PENDING) {
      throw new BadRequestException('该申请已审核');
    }
    if (dto.status === StationApplicationStatus.PENDING) {
      throw new BadRequestException('无效的审核状态');
    }

    const application = await this.prisma.stationApplication.update({
      where: { id },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote?.trim() || null,
        reviewedAt: new Date(),
      },
      include: {
        user: { select: { id: true, nickname: true } },
      },
    });

    return toApplicationDto(application);
  }
}

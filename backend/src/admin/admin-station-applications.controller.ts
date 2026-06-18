import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { StationApplicationStatus } from '@prisma/client';
import { AdminJwtGuard } from './admin-jwt.guard';
import { AdminStationApplicationsService } from './admin-station-applications.service';
import { ReviewStationApplicationDto } from './dto/review-station-application.dto';

@Controller('admin/station-applications')
@UseGuards(AdminJwtGuard)
export class AdminStationApplicationsController {
  constructor(private readonly applicationsService: AdminStationApplicationsService) {}

  @Get()
  findAll(@Query('status') status?: StationApplicationStatus) {
    return this.applicationsService.findAll(status);
  }

  @Patch(':id')
  review(@Param('id') id: string, @Body() dto: ReviewStationApplicationDto) {
    return this.applicationsService.review(id, dto);
  }
}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateStationApplicationDto } from './dto/create-station-application.dto';
import { StationApplicationsService } from './station-applications.service';

@Controller('station-applications')
export class StationApplicationsController {
  constructor(private readonly applicationsService: StationApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: User, @Body() dto: CreateStationApplicationDto) {
    return this.applicationsService.create(user, dto);
  }
}

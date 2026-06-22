import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PlantsService } from '../plants/plants.service';
import { SetStationOpenStatusDto } from './dto/set-station-open-status.dto';
import { SyncStationOpenStatusDto } from './dto/sync-station-open-status.dto';
import { UpdateManagedPlantDto } from './dto/update-managed-plant.dto';
import { UpdateManagedStationDto } from './dto/update-managed-station.dto';
import { StationsService } from './stations.service';

@Controller('stations')
export class StationsController {
  constructor(
    private readonly stationsService: StationsService,
    private readonly plantsService: PlantsService,
  ) {}

  @Get()
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.stationsService.findAll(activeOnly === 'true' || activeOnly === '1');
  }

  @Get(':id/manager-access')
  @UseGuards(JwtAuthGuard)
  getManagerAccess(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.stationsService.getManagerAccess(id, user.id);
  }

  @Patch(':id/open-status')
  @UseGuards(JwtAuthGuard)
  setOpenStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: SetStationOpenStatusDto,
  ) {
    return this.stationsService.setOpenStatus(user, id, dto.isActive);
  }

  @Post(':id/open-status/sync')
  @UseGuards(JwtAuthGuard)
  syncOpenStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: SyncStationOpenStatusDto,
  ) {
    return this.stationsService.syncOpenStatus(user.id, id, dto);
  }

  @Patch(':id/managed')
  @UseGuards(JwtAuthGuard)
  updateManaged(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: UpdateManagedStationDto,
  ) {
    return this.stationsService.updateManaged(user.id, id, dto);
  }

  @Get(':id/managed-plants')
  @UseGuards(JwtAuthGuard)
  findManagedPlants(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.stationsService.findManagedPlants(user.id, id);
  }

  @Patch(':id/plants/:plantId')
  @UseGuards(JwtAuthGuard)
  updateManagedPlant(
    @Param('id', ParseIntPipe) id: number,
    @Param('plantId') plantId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateManagedPlantDto,
  ) {
    return this.stationsService.updateManagedPlant(user.id, id, plantId, dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stationsService.findOne(id);
  }

  @Get(':id/navigation')
  getNavigation(@Param('id', ParseIntPipe) id: number) {
    return this.stationsService.resolveNavigationTarget(id);
  }

  @Get(':id/plants')
  findPlants(@Param('id', ParseIntPipe) id: number) {
    return this.plantsService.findAvailableByStation(id);
  }
}

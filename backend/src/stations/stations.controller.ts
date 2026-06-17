import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { StationsService } from './stations.service';
import { PlantsService } from '../plants/plants.service';

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

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stationsService.findOne(id);
  }

  @Get(':id/plants')
  findPlants(@Param('id', ParseIntPipe) id: number) {
    return this.plantsService.findAvailableByStation(id);
  }
}

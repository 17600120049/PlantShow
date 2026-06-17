import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtGuard } from './admin-jwt.guard';
import { AdminStationsService } from './admin-stations.service';
import { CreateStationDto, UpdateStationDto } from './dto/station.dto';

@Controller('admin/stations')
@UseGuards(AdminJwtGuard)
export class AdminStationsController {
  constructor(private readonly stationsService: AdminStationsService) {}

  @Get()
  findAll() {
    return this.stationsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateStationDto) {
    return this.stationsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStationDto) {
    return this.stationsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stationsService.remove(id);
  }
}

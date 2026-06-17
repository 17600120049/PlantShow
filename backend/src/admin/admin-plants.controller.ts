import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlantListStatus } from '@prisma/client';
import { AdminJwtGuard } from './admin-jwt.guard';
import { AdminPlantsService } from './admin-plants.service';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Controller('admin/plants')
@UseGuards(AdminJwtGuard)
export class AdminPlantsController {
  constructor(private readonly plantsService: AdminPlantsService) {}

  @Get()
  findAll(
    @Query('keyword') keyword?: string,
    @Query('listStatus') listStatus?: PlantListStatus,
    @Query('stationId') stationId?: string,
  ) {
    return this.plantsService.findAll({
      keyword,
      listStatus,
      stationId: stationId ? Number(stationId) : undefined,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlantDto) {
    return this.plantsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plantsService.remove(id);
  }
}

import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { PlantService } from './plant.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Plant, PlantStatus } from '@prisma/client';

@Controller('plants')
export class PlantController {
  constructor(private plantService: PlantService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createPlantDto: CreatePlantDto): Promise<Plant> {
    return this.plantService.create(createPlantDto, req.user.id);
  }

  @Get()
  async findAll(@Query('status') status?: PlantStatus): Promise<Plant[]> {
    return this.plantService.findAll(status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Plant> {
    return this.plantService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePlantDto: UpdatePlantDto): Promise<Plant> {
    return this.plantService.update(id, updatePlantDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Plant> {
    return this.plantService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/me')
  async getMyPlants(@Request() req): Promise<Plant[]> {
    return this.plantService.getPlantsByUser(req.user.id);
  }

  @Get('user/:userId')
  async getUserPlants(@Param('userId') userId: string): Promise<Plant[]> {
    return this.plantService.getPlantsByUser(userId);
  }
}

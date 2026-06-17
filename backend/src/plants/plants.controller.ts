import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { DonatePlantDto } from './dto/donate-plant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Get()
  findListed() {
    return this.plantsService.findListed();
  }

  @Get('code/:plantCode')
  findByCode(@Param('plantCode') plantCode: string) {
    return this.plantsService.findByCode(plantCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantsService.findOne(id);
  }

  @Post('donate')
  @UseGuards(JwtAuthGuard)
  donate(@CurrentUser() user: User, @Body() dto: DonatePlantDto) {
    return this.plantsService.donate(user, dto);
  }

  @Post(':id/adopt')
  @UseGuards(JwtAuthGuard)
  adopt(@CurrentUser() user: User, @Param('id') id: string) {
    return this.plantsService.adopt(user, id);
  }
}

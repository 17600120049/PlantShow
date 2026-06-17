import {
  Body,
  Controller,
  Delete,
  Get,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto, RemoveFavoriteDto } from './dto/favorite.dto';

@Controller('users/me/favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.favoritesService.list(user);
  }

  @Get('check')
  check(
    @CurrentUser() user: User,
    @Query('plantId') plantId?: string,
    @Query('stationId') stationId?: string,
  ) {
    if (plantId) {
      return this.favoritesService.checkPlant(user, plantId);
    }
    if (stationId) {
      return this.favoritesService.checkStation(user, Number(stationId));
    }
    return { favorited: false };
  }

  @Post()
  add(@CurrentUser() user: User, @Body() dto: AddFavoriteDto) {
    return this.favoritesService.add(user, dto);
  }

  @Delete()
  remove(
    @CurrentUser() user: User,
    @Query('targetType') targetType: 'plant' | 'station',
    @Query('plantId') plantId?: string,
    @Query('stationId') stationId?: string,
  ) {
    const dto: RemoveFavoriteDto = {
      targetType,
      plantId,
      stationId: stationId ? Number(stationId) : undefined,
    };
    return this.favoritesService.remove(user, dto);
  }
}

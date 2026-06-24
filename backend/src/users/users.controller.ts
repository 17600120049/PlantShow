import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthService } from '../auth/auth.service';
import { StationsService } from '../stations/stations.service';
import { SyncStationOpenStatusDto } from '../stations/dto/sync-station-open-status.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly stationsService: StationsService,
  ) {}

  @Get('me/managed-stations')
  @UseGuards(JwtAuthGuard)
  getManagedStations(@CurrentUser() user: User) {
    return this.stationsService.findManagedByUser(user.id);
  }

  @Post('me/managed-stations/open-status/sync')
  @UseGuards(JwtAuthGuard)
  syncManagedOpenStatus(
    @CurrentUser() user: User,
    @Body() dto: SyncStationOpenStatusDto,
  ) {
    return this.stationsService.syncManagedOpenStatus(user.id, dto);
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@CurrentUser() user: User) {
    const freshUser = await this.authService.ensureWelcomePointsBalance(user);
    return this.usersService.getStats(freshUser);
  }

  @Get('me/donations')
  @UseGuards(JwtAuthGuard)
  getDonations(@CurrentUser() user: User) {
    return this.usersService.getDonations(user);
  }

  @Get('me/adoptions')
  @UseGuards(JwtAuthGuard)
  getAdoptions(@CurrentUser() user: User) {
    return this.usersService.getAdoptions(user);
  }

  @Get('me/points')
  @UseGuards(JwtAuthGuard)
  async getPointsHistory(@CurrentUser() user: User) {
    const freshUser = await this.authService.ensureWelcomePointsBalance(user);
    return this.usersService.getPointsHistory(freshUser);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    const freshUser = await this.authService.ensureWelcomePointsBalance(user);
    return this.authService.toUserDto(freshUser);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    const updated = await this.usersService.updateProfile(user, dto);
    return this.authService.toUserDto(updated);
  }
}

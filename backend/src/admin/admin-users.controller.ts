import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtGuard } from './admin-jwt.guard';
import { AdminUsersService } from './admin-users.service';
import { AdjustPointsDto, UpdateUserDto } from './dto/update-user.dto';

@Controller('admin/users')
@UseGuards(AdminJwtGuard)
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get()
  findAll(@Query('keyword') keyword?: string) {
    return this.usersService.findAll(keyword);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Post(':id/points')
  adjustPoints(@Param('id') id: string, @Body() dto: AdjustPointsDto) {
    return this.usersService.adjustPoints(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

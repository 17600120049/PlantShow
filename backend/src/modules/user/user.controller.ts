import { Controller, Get, Put, Body, Param, Post, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req): Promise<User> {
    return this.userService.findOne(req.user.id);
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('follow/:userId')
  async follow(@Request() req, @Param('userId') userId: string) {
    return this.userService.follow(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('follow/:userId')
  async unfollow(@Request() req, @Param('userId') userId: string) {
    return this.userService.unfollow(req.user.id, userId);
  }

  @Get(':id/following')
  async getFollowing(@Param('id') id: string): Promise<User[]> {
    return this.userService.getFollowing(id);
  }

  @Get(':id/followers')
  async getFollowers(@Param('id') id: string): Promise<User[]> {
    return this.userService.getFollowers(id);
  }
}

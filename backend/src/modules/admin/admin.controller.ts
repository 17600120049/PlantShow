import { Controller, Get, Post as PostMethod, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { Admin, User, Plant, Post as PostModel, Report, ReportStatus } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @PostMethod('login')
  async login(@Body() loginAdminDto: LoginAdminDto): Promise<{ accessToken: string; admin: Admin }> {
    return this.adminService.login(loginAdminDto);
  }

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ users: User[]; total: number }> {
    return this.adminService.getUsers(page, limit);
  }

  @Delete('users/:userId')
  async deleteUser(@Param('userId') userId: string): Promise<void> {
    return this.adminService.deleteUser(userId);
  }

  @Get('plants')
  async getPlants(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ plants: Plant[]; total: number }> {
    return this.adminService.getPlants(page, limit);
  }

  @Delete('plants/:plantId')
  async deletePlant(@Param('plantId') plantId: string): Promise<void> {
    return this.adminService.deletePlant(plantId);
  }

  @Get('posts')
  async getPosts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ posts: PostModel[]; total: number }> {
    return this.adminService.getPosts(page, limit);
  }

  @Delete('posts/:postId')
  async deletePost(@Param('postId') postId: string): Promise<void> {
    return this.adminService.deletePost(postId);
  }

  @Get('reports')
  async getReports(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ reports: Report[]; total: number }> {
    return this.adminService.getReports(page, limit);
  }

  @Put('reports/:reportId')
  async updateReport(
    @Param('reportId') reportId: string,
    @Body() body: { status: ReportStatus },
  ): Promise<Report> {
    return this.adminService.updateReport(reportId, body.status);
  }
}

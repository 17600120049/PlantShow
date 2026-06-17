import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from './admin-jwt.guard';
import { AdminDashboardService } from './admin-dashboard.service';

@Controller('admin/dashboard')
@UseGuards(AdminJwtGuard)
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get()
  getStats() {
    return this.dashboardService.getStats();
  }
}

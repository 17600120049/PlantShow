import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StationApplicationsController } from './station-applications.controller';
import { StationApplicationsService } from './station-applications.service';

@Module({
  imports: [AuthModule],
  controllers: [StationApplicationsController],
  providers: [StationApplicationsService],
  exports: [StationApplicationsService],
})
export class StationApplicationsModule {}

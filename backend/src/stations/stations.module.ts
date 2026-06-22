import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';
import { PlantsModule } from '../plants/plants.module';

@Module({
  imports: [PlantsModule, AuthModule],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService],
})
export class StationsModule {}

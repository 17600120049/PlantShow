import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { StationsModule } from '../stations/stations.module';

@Module({
  imports: [AuthModule, StationsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

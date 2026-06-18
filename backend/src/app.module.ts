import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StationsModule } from './stations/stations.module';
import { PlantsModule } from './plants/plants.module';
import { QrModule } from './qr/qr.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { FavoritesModule } from './favorites/favorites.module';
import { StationApplicationsModule } from './station-applications/station-applications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    PrismaModule,
    AuthModule,
    StationsModule,
    PlantsModule,
    QrModule,
    UsersModule,
    FavoritesModule,
    StationApplicationsModule,
    AdminModule,
  ],
})
export class AppModule {}

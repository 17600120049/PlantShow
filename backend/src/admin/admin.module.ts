import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminJwtStrategy } from './admin-jwt.strategy';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminStationsService } from './admin-stations.service';
import { AdminStationsController } from './admin-stations.controller';
import { AdminPlantsService } from './admin-plants.service';
import { AdminPlantsController } from './admin-plants.controller';
import { AdminUploadController } from './admin-upload.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'admin-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'ADMIN_JWT_SECRET',
          configService.get<string>('JWT_SECRET', 'plant-wander-jwt-secret-key-2024'),
        ),
        signOptions: {
          expiresIn: configService.get<string>('ADMIN_JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminDashboardController,
    AdminUsersController,
    AdminStationsController,
    AdminPlantsController,
    AdminUploadController,
  ],
  providers: [
    AdminAuthService,
    AdminJwtStrategy,
    AdminDashboardService,
    AdminUsersService,
    AdminStationsService,
    AdminPlantsService,
  ],
})
export class AdminModule {}

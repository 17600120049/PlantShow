import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PlantModule } from './modules/plant/plant.module';
import { SocialModule } from './modules/social/social.module';
import { TradeModule } from './modules/trade/trade.module';
import { MessageModule } from './modules/message/message.module';
import { AdminModule } from './modules/admin/admin.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RedisModule } from './shared/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    PlantModule,
    SocialModule,
    TradeModule,
    MessageModule,
    AdminModule,
  ],
})
export class AppModule {}

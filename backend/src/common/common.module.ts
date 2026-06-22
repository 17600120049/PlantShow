import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GeocodingService } from './geocoding.service';
import { UploadController } from './upload.controller';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [UploadController],
  providers: [GeocodingService],
  exports: [GeocodingService],
})
export class CommonModule {}

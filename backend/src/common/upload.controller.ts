import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { imageUploadOptions, toUploadResponse } from './upload-storage';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  upload(@UploadedFile() file?: { filename: string }) {
    if (!file) {
      throw new BadRequestException('请选择图片文件');
    }
    return toUploadResponse(file);
  }
}

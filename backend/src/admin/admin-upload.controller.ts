import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminJwtGuard } from './admin-jwt.guard';
import { imageUploadOptions, toUploadResponse } from '../common/upload-storage';

@Controller('admin/upload')
@UseGuards(AdminJwtGuard)
export class AdminUploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  upload(@UploadedFile() file?: { filename: string }) {
    if (!file) {
      throw new BadRequestException('请选择图片文件');
    }
    return toUploadResponse(file);
  }
}

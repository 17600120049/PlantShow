import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { AdminJwtGuard } from './admin-jwt.guard';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

@Controller('admin/upload')
@UseGuards(AdminJwtGuard)
export class AdminUploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, callback) => {
          const ext = extname(file.originalname || '').toLowerCase();
          const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
            ? ext
            : '.jpg';
          callback(null, `${randomUUID()}${safeExt}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('仅支持上传图片'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  upload(@UploadedFile() file?: { filename: string; originalname: string; mimetype: string }) {
    if (!file) {
      throw new BadRequestException('请选择图片文件');
    }
    return {
      url: `/api/uploads/${file.filename}`,
      filename: file.filename,
    };
  }
}

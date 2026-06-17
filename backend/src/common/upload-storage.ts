import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

export const UPLOAD_DIR = join(process.cwd(), 'uploads');

type UploadedImageFile = {
  originalname?: string;
  mimetype: string;
};

export const imageUploadOptions = {
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
  fileFilter: (
    _req: unknown,
    file: UploadedImageFile,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new BadRequestException('仅支持上传图片'), false);
      return;
    }
    callback(null, true);
  },
};

export function toUploadResponse(file: { filename: string }) {
  return {
    url: `/api/uploads/${file.filename}`,
    filename: file.filename,
  };
}

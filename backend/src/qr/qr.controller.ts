import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { QrService } from './qr.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPlantQrPayload,
  buildStationQrPayload,
} from '../common/mappers';

@Controller('qr')
export class QrController {
  constructor(
    private readonly qrService: QrService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('plant/:plantCode')
  async plantQr(
    @Param('plantCode') plantCode: string,
    @Query('format') format: string,
    @Query('size') size: string,
    @Res() res: Response,
  ) {
    const plant = await this.prisma.plant.findUnique({
      where: { plantCode: plantCode.toUpperCase() },
    });
    if (!plant) {
      throw new NotFoundException('植物不存在');
    }

    const qrSize = size ? Number(size) : 320;
    const payload = buildPlantQrPayload(plant.plantCode);

    if (format === 'json') {
      const dataUrl = await this.qrService.generateDataUrl(payload, qrSize);
      return res.json({
        type: 'plant',
        plantCode: plant.plantCode,
        payload,
        dataUrl,
        imageUrl: `/api/qr/plant/${plant.plantCode}?size=${qrSize}`,
      });
    }

    const buffer = await this.qrService.plantQrPng(plant.plantCode, qrSize);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  }

  @Get('station/:id')
  async stationQr(
    @Param('id', ParseIntPipe) id: number,
    @Query('format') format: string,
    @Query('size') size: string,
    @Res() res: Response,
  ) {
    const station = await this.prisma.station.findUnique({ where: { id } });
    if (!station) {
      throw new NotFoundException('驿站不存在');
    }

    const qrSize = size ? Number(size) : 320;
    const payload = buildStationQrPayload(id);

    if (format === 'json') {
      const dataUrl = await this.qrService.generateDataUrl(payload, qrSize);
      return res.json({
        type: 'station',
        stationId: id,
        stationName: station.name,
        payload,
        dataUrl,
        imageUrl: `/api/qr/station/${id}?size=${qrSize}`,
      });
    }

    const buffer = await this.qrService.stationQrPng(id, qrSize);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  }
}

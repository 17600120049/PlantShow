import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import {
  buildPlantQrPayload,
  buildStationQrPayload,
} from '../common/mappers';

@Injectable()
export class QrService {
  async generatePng(payload: string, size = 320) {
    return QRCode.toBuffer(payload, {
      type: 'png',
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#1A2E24',
        light: '#FFFFFF',
      },
    });
  }

  async generateDataUrl(payload: string, size = 320) {
    return QRCode.toDataURL(payload, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#1A2E24',
        light: '#FFFFFF',
      },
    });
  }

  async plantQrPng(plantCode: string, size?: number) {
    return this.generatePng(buildPlantQrPayload(plantCode), size);
  }

  async stationQrPng(stationId: number, size?: number) {
    return this.generatePng(buildStationQrPayload(stationId), size);
  }

  async plantQrDataUrl(plantCode: string, size?: number) {
    return this.generateDataUrl(buildPlantQrPayload(plantCode), size);
  }

  async stationQrDataUrl(stationId: number, size?: number) {
    return this.generateDataUrl(buildStationQrPayload(stationId), size);
  }
}

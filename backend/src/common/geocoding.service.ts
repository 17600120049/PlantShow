import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  normalizedAddress?: string;
};

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  constructor(private readonly configService: ConfigService) {}

  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    const trimmed = address?.trim();
    if (!trimmed) {
      return null;
    }

    const candidates = this.buildAddressCandidates(trimmed);
    const tencentKey = this.configService.get<string>('TENCENT_MAP_KEY');
    const amapKey = this.configService.get<string>('AMAP_KEY');

    for (const candidate of candidates) {
      const city = this.detectCity(candidate);

      if (tencentKey) {
        const searchResult = await this.searchPlaceWithTencent(candidate, tencentKey, city);
        if (searchResult) {
          return searchResult;
        }

        const tencentResult = await this.geocodeWithTencent(candidate, tencentKey);
        if (tencentResult) {
          return tencentResult;
        }
      }

      if (amapKey) {
        const searchResult = await this.searchPlaceWithAmap(candidate, amapKey, city);
        if (searchResult) {
          return searchResult;
        }

        const amapResult = await this.geocodeWithAmap(candidate, amapKey, city);
        if (amapResult) {
          return amapResult;
        }
      }
    }

    this.logger.warn(
      `Unable to geocode address "${trimmed}". Configure TENCENT_MAP_KEY or AMAP_KEY.`,
    );
    return null;
  }

  private buildAddressCandidates(address: string): string[] {
    const candidates = new Set<string>([address]);

    if (!/(北京|beijing)/i.test(address) && /(朝阳|海淀|通州|顺义|昌平|E50|双桥)/i.test(address)) {
      candidates.add(`北京市${address}`);
    }

    if (!/(杭州|浙江)/.test(address) && /(余杭|西湖|拱墅|良渚|转塘|运河)/.test(address)) {
      candidates.add(`浙江省杭州市${address}`);
      candidates.add(`杭州市${address}`);
    }

    return [...candidates];
  }

  private detectCity(address: string): string | undefined {
    if (/北京|朝阳|海淀|通州|顺义|昌平|E50|双桥/i.test(address)) {
      return '北京';
    }
    if (/杭州|余杭|西湖|拱墅|良渚|转塘|运河/i.test(address)) {
      return '杭州';
    }
    return undefined;
  }

  private async searchPlaceWithTencent(
    keyword: string,
    key: string,
    city?: string,
  ): Promise<GeocodeResult | null> {
    try {
      const boundary = city
        ? 'region(' + encodeURIComponent(city) + ',0)'
        : 'region(全国,0)';
      const url =
        'https://apis.map.qq.com/ws/place/v1/search?keyword=' +
        encodeURIComponent(keyword) +
        '&boundary=' +
        boundary +
        '&page_size=1&page_index=1&key=' +
        encodeURIComponent(key);
      const response = await fetch(url);
      const data = (await response.json()) as {
        status?: number;
        data?: Array<{ location?: { lat?: number; lng?: number }; address?: string }>;
      };

      if (data.status !== 0 || !data.data?.length) {
        return null;
      }

      const place = data.data[0];
      const { lat, lng } = place.location || {};
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return null;
      }

      return {
        latitude: lat,
        longitude: lng,
        normalizedAddress: place.address || keyword,
      };
    } catch (error) {
      this.logger.warn(`Tencent place search failed: ${String(error)}`);
      return null;
    }
  }

  private async searchPlaceWithAmap(
    keyword: string,
    key: string,
    city?: string,
  ): Promise<GeocodeResult | null> {
    try {
      let url =
        'https://restapi.amap.com/v3/place/text?keywords=' +
        encodeURIComponent(keyword) +
        '&offset=1&page=1&extensions=base&key=' +
        encodeURIComponent(key);
      if (city) {
        url += '&city=' + encodeURIComponent(city);
      }

      const response = await fetch(url);
      const data = (await response.json()) as {
        status?: string;
        info?: string;
        pois?: Array<{ location?: string; address?: string; name?: string }>;
      };

      if (data.status !== '1' || !data.pois?.length) {
        if (data.status === '0' && data.info) {
          this.logger.warn(`Amap place search rejected: ${data.info}`);
        }
        return null;
      }

      const place = data.pois[0];
      if (!place.location) {
        return null;
      }

      const [lng, lat] = place.location.split(',').map(Number);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      return {
        latitude: lat,
        longitude: lng,
        normalizedAddress: place.address || place.name || keyword,
      };
    } catch (error) {
      this.logger.warn(`Amap place search failed: ${String(error)}`);
      return null;
    }
  }

  private async geocodeWithTencent(
    address: string,
    key: string,
  ): Promise<GeocodeResult | null> {
    try {
      const url =
        'https://apis.map.qq.com/ws/geocoder/v1/?address=' +
        encodeURIComponent(address) +
        '&key=' +
        encodeURIComponent(key);
      const response = await fetch(url);
      const data = (await response.json()) as {
        status?: number;
        result?: { location?: { lat?: number; lng?: number } };
      };

      if (data.status !== 0 || !data.result?.location) {
        return null;
      }

      const { lat, lng } = data.result.location;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return null;
      }

      return { latitude: lat, longitude: lng, normalizedAddress: address };
    } catch (error) {
      this.logger.warn(`Tencent geocoding failed: ${String(error)}`);
      return null;
    }
  }

  private async geocodeWithAmap(
    address: string,
    key: string,
    city?: string,
  ): Promise<GeocodeResult | null> {
    try {
      let url =
        'https://restapi.amap.com/v3/geocode/geo?address=' +
        encodeURIComponent(address) +
        '&key=' +
        encodeURIComponent(key);
      if (city) {
        url += '&city=' + encodeURIComponent(city);
      }

      const response = await fetch(url);
      const data = (await response.json()) as {
        status?: string;
        info?: string;
        geocodes?: Array<{ location?: string }>;
      };

      if (data.status !== '1' || !data.geocodes?.length) {
        if (data.status === '0' && data.info) {
          this.logger.warn(`Amap geocode rejected: ${data.info}`);
        }
        return null;
      }

      const location = data.geocodes[0].location;
      if (!location) {
        return null;
      }

      const [lng, lat] = location.split(',').map(Number);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      return { latitude: lat, longitude: lng, normalizedAddress: address };
    } catch (error) {
      this.logger.warn(`Amap geocoding failed: ${String(error)}`);
      return null;
    }
  }
}

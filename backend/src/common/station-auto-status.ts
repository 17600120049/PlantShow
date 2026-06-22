export const DEFAULT_AUTO_CLOSE_HOURS = 6;
export const DEFAULT_AUTO_OPEN_RADIUS_M = 150;

export type StationAutoDetectInput = {
  wifiSsid?: string;
  latitude?: number;
  longitude?: number;
};

export type StationAutoDetectResult = {
  atStation: boolean | null;
  method: 'wifi' | 'location' | null;
  distanceM?: number;
};

export function normalizeWifiSsid(value?: string | null): string {
  return (value || '').trim().toLowerCase();
}

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusM = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function detectAtStation(
  station: {
    wifiSsid?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    autoOpenRadiusM?: number | null;
  },
  input: StationAutoDetectInput,
): StationAutoDetectResult {
  const configuredWifi = normalizeWifiSsid(station.wifiSsid);
  const hasCoords =
    typeof station.latitude === 'number' &&
    typeof station.longitude === 'number' &&
    Number.isFinite(station.latitude) &&
    Number.isFinite(station.longitude);
  const radius = station.autoOpenRadiusM || DEFAULT_AUTO_OPEN_RADIUS_M;

  let wifiResult: boolean | null = null;
  let locationResult: boolean | null = null;
  let method: 'wifi' | 'location' | null = null;
  let distanceM: number | undefined;

  if (configuredWifi && input.wifiSsid) {
    wifiResult = normalizeWifiSsid(input.wifiSsid) === configuredWifi;
    if (wifiResult) {
      method = 'wifi';
    }
  }

  if (
    hasCoords &&
    typeof input.latitude === 'number' &&
    typeof input.longitude === 'number' &&
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude)
  ) {
    distanceM = haversineMeters(
      input.latitude,
      input.longitude,
      station.latitude!,
      station.longitude!,
    );
    locationResult = distanceM <= radius;
    if (locationResult && !method) {
      method = 'location';
    }
  }

  if (!configuredWifi && !hasCoords) {
    return { atStation: null, method: null };
  }

  const results = [wifiResult, locationResult].filter(
    (value): value is boolean => value !== null,
  );
  if (!results.length) {
    return { atStation: null, method: null, distanceM };
  }

  return {
    atStation: results.some(Boolean),
    method,
    distanceM,
  };
}

export function isAutoCloseExpired(
  lastOpenConfirmedAt: Date | null | undefined,
  autoCloseHours: number,
  now = new Date(),
): boolean {
  if (!lastOpenConfirmedAt) {
    return false;
  }
  const hours = autoCloseHours > 0 ? autoCloseHours : DEFAULT_AUTO_CLOSE_HOURS;
  const elapsedMs = now.getTime() - lastOpenConfirmedAt.getTime();
  return elapsedMs >= hours * 60 * 60 * 1000;
}

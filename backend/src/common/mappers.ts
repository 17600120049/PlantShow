import { Plant, PlantListStatus, PlantStatus, Station, StationHoursMode } from '@prisma/client';
import {
  DEFAULT_AUTO_CLOSE_HOURS,
  DEFAULT_AUTO_OPEN_RADIUS_M,
} from './station-auto-status';
import {
  formatStationHoursDisplay,
  isFlexibleHoursMode,
  resolveStationIsActive,
} from './station-hours';
import { parsePlantPhotos, getPlantCoverPhoto } from './plant-photos';

export const DONATE_POINTS = 10;
export const WELCOME_POINTS = 10;
export const QR_PREFIX = 'plantshow://';

export function getEffectivePoints(user: { points: number; inviteUnlocked: boolean }) {
  return user.inviteUnlocked ? user.points : 0;
}

export function getLockedPoints(user: { points: number; inviteUnlocked: boolean }) {
  return user.inviteUnlocked ? 0 : user.points;
}

export type PlantWithStation = Plant & {
  station?: Station | null;
  breeder?: { nickname: string } | null;
  histories?: Array<{ owner: { nickname: string } }>;
};

export function formatDate(date?: Date | null) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateTime(date?: Date | null) {
  if (!date) return '';
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${formatDate(date)} ${hh}:${mm}`;
}

export function toPlantStatusLabel(plant: Pick<Plant, 'status' | 'listStatus'>) {
  if (plant.listStatus === PlantListStatus.AVAILABLE) {
    return '待领养';
  }
  if (plant.status === PlantStatus.ADOPTED) {
    return '已领养';
  }
  return '养护中';
}

export function toPlantDto(plant: PlantWithStation) {
  const photos = parsePlantPhotos(plant);
  return {
    id: plant.id,
    plantCode: plant.plantCode,
    name: plant.name,
    category: plant.species,
    species: plant.species,
    status: toPlantStatusLabel(plant),
    image: plant.imageEmoji || '🌿',
    imageEmoji: plant.imageEmoji || '🌿',
    photoUrl: getPlantCoverPhoto(plant),
    photos,
    station: plant.station?.name || null,
    stationId: plant.stationId,
    donateTime: formatDate(plant.listedAt),
    adoptTime: formatDate(plant.adoptedAt),
    donorName:
      plant.histories?.[0]?.owner?.nickname || plant.breeder?.nickname || '',
    description: plant.description || '',
    listStatus: plant.listStatus,
    plantStatus: plant.status,
  };
}

export function toStationDto(
  station: Station & { _count?: { plants: number } },
  distance = '—',
) {
  const plantCount = station._count?.plants ?? 0;
  const hoursMode = station.hoursMode || StationHoursMode.FIXED;
  return {
    id: station.id,
    stationCode: station.stationCode,
    name: station.name,
    image: station.logoUrl || station.imageEmoji,
    imageEmoji: station.imageEmoji,
    logoUrl: station.logoUrl,
    address: station.address,
    hours: formatStationHoursDisplay(station.hours, hoursMode),
    hoursMode,
    contactType: station.contactType,
    phone: station.phone,
    plants: plantCount,
    distance,
    isActive: resolveStationIsActive({
      hours: station.hours,
      hoursMode,
      isActive: station.isActive,
    }),
    manualOpen: station.isActive,
    isFlexibleHours: isFlexibleHoursMode(hoursMode),
  };
}

export function toStationAutoStatusFields(station: Station) {
  return {
    wifiSsid: station.wifiSsid || '',
    autoOpenRadiusM: station.autoOpenRadiusM ?? DEFAULT_AUTO_OPEN_RADIUS_M,
    autoCloseHours: station.autoCloseHours ?? DEFAULT_AUTO_CLOSE_HOURS,
    autoStatusEnabled: station.autoStatusEnabled ?? true,
    lastOpenConfirmedAt: formatDateTime(station.lastOpenConfirmedAt),
    hasAutoLocation:
      typeof station.latitude === 'number' &&
      typeof station.longitude === 'number' &&
      Number.isFinite(station.latitude) &&
      Number.isFinite(station.longitude),
  };
}

export function buildPlantQrPayload(plantCode: string) {
  return `${QR_PREFIX}plant/${plantCode}`;
}

export function buildStationQrPayload(stationId: number | string) {
  return `${QR_PREFIX}station/${stationId}`;
}

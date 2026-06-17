import { Plant, PlantListStatus, PlantStatus, Station } from '@prisma/client';
import { isStationOpenByHours } from './station-hours';
import { parsePlantPhotos } from './plant-photos';

export const DONATE_POINTS = 10;
export const QR_PREFIX = 'plantwander://';

export type PlantWithStation = Plant & { station?: Station | null };

export function formatDate(date?: Date | null) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
    photoUrl: photos[0] || plant.photoUrl || null,
    photos,
    station: plant.station?.name || null,
    stationId: plant.stationId,
    donateTime: formatDate(plant.listedAt),
    adoptTime: formatDate(plant.adoptedAt),
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
  return {
    id: station.id,
    stationCode: station.stationCode,
    name: station.name,
    image: station.logoUrl || station.imageEmoji,
    imageEmoji: station.imageEmoji,
    logoUrl: station.logoUrl,
    address: station.address,
    hours: station.hours,
    phone: station.phone,
    plants: plantCount,
    distance,
    isActive: isStationOpenByHours(station.hours),
  };
}

export function buildPlantQrPayload(plantCode: string) {
  return `${QR_PREFIX}plant/${plantCode}`;
}

export function buildStationQrPayload(stationId: number | string) {
  return `${QR_PREFIX}station/${stationId}`;
}

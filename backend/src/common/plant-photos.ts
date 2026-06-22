import { Prisma } from '@prisma/client';

export type PlantPhotoRecord = {
  photos?: unknown;
};

function isLocalPhotoPath(url: string): boolean {
  return (
    /^wxfile:/.test(url) ||
    /^http:\/\/tmp/.test(url) ||
    /^tmp\//.test(url) ||
    /^\/tmp\//.test(url)
  );
}

/** Extract upload path from full or relative URL, e.g. /api/uploads/abc.jpg */
export function normalizePhotoPath(url: unknown): string {
  if (typeof url !== 'string') {
    return '';
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }
  if (isLocalPhotoPath(trimmed)) {
    return '';
  }

  const uploadsMatch = trimmed.match(/\/api\/uploads\/[^?#]+/);
  if (uploadsMatch) {
    return uploadsMatch[0];
  }
  if (trimmed.startsWith('/api/')) {
    return trimmed.split('?')[0];
  }
  return trimmed;
}

/** Deduplicated, normalized photo paths for persistence */
export function normalizePhotosInput(photos?: string[] | null): string[] {
  if (!photos?.length) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of photos) {
    const path = normalizePhotoPath(item);
    if (path && !seen.has(path)) {
      seen.add(path);
      result.push(path);
    }
  }

  return result;
}

export function parsePlantPhotos(plant: PlantPhotoRecord): string[] {
  if (!plant.photos) {
    return [];
  }

  const value = plant.photos;
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizePhotoPath)
    .filter(Boolean);
}

export function getPlantCoverPhoto(plant: PlantPhotoRecord): string | null {
  const photos = parsePlantPhotos(plant);
  return photos[0] || null;
}

export function photosToPrismaJson(
  photos?: string[] | null,
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (photos === undefined) {
    return undefined;
  }

  const normalized = normalizePhotosInput(photos);
  if (!normalized.length) {
    return Prisma.JsonNull;
  }

  return normalized;
}

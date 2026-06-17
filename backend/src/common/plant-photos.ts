import { Prisma } from '@prisma/client';

export function parsePlantPhotos(
  plant: { photos?: unknown; photoUrl?: string | null },
): string[] {
  if (plant.photos) {
    const value = plant.photos;
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }
  }
  if (plant.photoUrl) {
    return [plant.photoUrl];
  }
  return [];
}

export function photosToPrismaJson(photos?: string[]): Prisma.InputJsonValue | undefined {
  if (photos === undefined) {
    return undefined;
  }
  return photos;
}
